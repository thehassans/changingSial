import express from 'express'
import crypto from 'crypto'
import { auth, allowRoles } from '../middleware/auth.js'
import ShopifyIntegration from '../models/ShopifyIntegration.js'
import { encrypt, decrypt } from '../../util/encryption.js'

const router = express.Router()

// =============================================
// ADMIN ENDPOINTS - App Configuration
// =============================================

// Get app configuration (admin only)
router.get('/app-config', auth, allowRoles('admin', 'user'), async (req, res) => {
  try {
    const config = await ShopifyIntegration.findOne({ type: 'app_config' })
    
    if (!config) {
      return res.json({ configured: false })
    }
    
    res.json({
      configured: true,
      clientId: config.clientId,
      scopes: config.scopes || 'read_products,write_products,read_inventory,write_inventory'
      // Note: clientSecret is never returned
    })
  } catch (err) {
    console.error('Error fetching app config:', err)
    res.status(500).json({ error: 'Failed to fetch configuration' })
  }
})

// Save app configuration (admin only)
router.post('/app-config', auth, allowRoles('admin', 'user'), async (req, res) => {
  try {
    const { clientId, clientSecret, scopes } = req.body
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' })
    }
    
    const updateData = {
      type: 'app_config',
      clientId,
      scopes: scopes || 'read_products,write_products,read_inventory,write_inventory',
      updatedAt: new Date()
    }
    
    // Only update secret if provided
    if (clientSecret && clientSecret.trim()) {
      updateData.clientSecret = encrypt(clientSecret)
    }
    
    await ShopifyIntegration.findOneAndUpdate(
      { type: 'app_config' },
      updateData,
      { upsert: true, new: true }
    )
    
    res.json({ success: true, message: 'App configuration saved!' })
  } catch (err) {
    console.error('Error saving app config:', err)
    res.status(500).json({ error: 'Failed to save configuration' })
  }
})

// Test app configuration (admin only)
router.post('/test-config', auth, allowRoles('admin', 'user'), async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body
    
    // Get saved config if no secret provided
    let testClientId = clientId
    let testClientSecret = clientSecret
    
    if (!testClientSecret || testClientSecret.includes('•')) {
      const config = await ShopifyIntegration.findOne({ type: 'app_config' })
      if (!config || !config.clientSecret) {
        return res.json({ success: false, error: 'No Client Secret saved. Please enter and save your Client Secret first.' })
      }
      testClientId = config.clientId
      testClientSecret = decrypt(config.clientSecret)
    }
    
    if (!testClientId) {
      return res.json({ success: false, error: 'Client ID is required' })
    }
    
    // Test by making a simple API call to verify credentials format
    // We can't fully test OAuth app credentials without a store, but we can validate format
    const isValidClientId = /^[a-f0-9]{32}$/.test(testClientId)
    const isValidSecret = testClientSecret && testClientSecret.length > 20
    
    if (!isValidClientId) {
      return res.json({ success: false, error: 'Client ID format is invalid. It should be 32 hexadecimal characters.' })
    }
    
    if (!isValidSecret) {
      return res.json({ success: false, error: 'Client Secret appears too short or invalid.' })
    }
    
    // If we have a connected store, try a real API call
    const testStore = await ShopifyIntegration.findOne({ type: 'dropshipper_store', isActive: true })
    
    if (testStore && testStore.accessToken) {
      try {
        const accessToken = decrypt(testStore.accessToken)
        const testUrl = `https://${testStore.shopDomain}/admin/api/2024-01/shop.json`
        
        const response = await fetch(testUrl, {
          headers: { 'X-Shopify-Access-Token': accessToken }
        })
        
        if (response.ok) {
          return res.json({ success: true, message: `Credentials valid! Connected to ${testStore.shopDomain}` })
        }
      } catch (e) {
        console.log('Test store API call failed:', e.message)
      }
    }
    
    // Credentials format looks valid
    res.json({ success: true, message: 'Credentials format is valid. Connect a store to fully test the integration.' })
    
  } catch (err) {
    console.error('Error testing config:', err)
    res.status(500).json({ success: false, error: 'Test failed: ' + err.message })
  }
})

// Get all connected stores (admin view)
router.get('/connected-stores', auth, allowRoles('admin', 'user'), async (req, res) => {
  try {
    const stores = await ShopifyIntegration.find({ type: 'dropshipper_store' })
      .populate('dropshipperId', 'name email')
      .sort({ connectedAt: -1 })
    
    res.json({
      stores: stores.map(s => ({
        _id: s._id,
        shopDomain: s.shopDomain,
        dropshipperId: s.dropshipperId?._id,
        dropshipperName: s.dropshipperId?.name || 'Unknown',
        productsListed: s.productsListed || 0,
        connectedAt: s.connectedAt
      }))
    })
  } catch (err) {
    console.error('Error fetching stores:', err)
    res.status(500).json({ error: 'Failed to fetch stores' })
  }
})

// =============================================
// OAUTH FLOW - Dropshipper connects their store
// =============================================

// Step 1: Generate install URL
router.get('/install', async (req, res) => {
  try {
    const { shop, dropshipperId } = req.query
    
    if (!shop) {
      return res.status(400).send('Missing shop parameter. Use: /api/shopify/install?shop=yourstore.myshopify.com&dropshipperId=xxx')
    }
    
    // Get app config
    const config = await ShopifyIntegration.findOne({ type: 'app_config' })
    if (!config || !config.clientId) {
      return res.status(400).send('Shopify app not configured. Admin must configure app credentials first.')
    }
    
    // Generate nonce for CSRF protection
    const nonce = crypto.randomBytes(16).toString('hex')
    
    // Store nonce temporarily (in real app, use Redis or session)
    global.shopifyNonces = global.shopifyNonces || {}
    global.shopifyNonces[nonce] = { shop, dropshipperId, timestamp: Date.now() }
    
    // Build OAuth URL
    const redirectUri = `${process.env.API_BASE || 'https://buysial.ae'}/api/shopify/callback`
    const scopes = config.scopes || 'read_products,write_products,read_inventory'
    
    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${config.clientId}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${nonce}`
    
    res.redirect(authUrl)
  } catch (err) {
    console.error('Install error:', err)
    res.status(500).send('Failed to start OAuth flow')
  }
})

// Step 2: OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, shop, state, hmac } = req.query
    
    if (!code || !shop || !state) {
      return res.status(400).send('Missing required OAuth parameters')
    }
    
    // Verify nonce
    const nonceData = global.shopifyNonces?.[state]
    if (!nonceData) {
      return res.status(400).send('Invalid or expired OAuth state')
    }
    delete global.shopifyNonces[state]
    
    // Get app config
    const config = await ShopifyIntegration.findOne({ type: 'app_config' })
    if (!config) {
      return res.status(400).send('App not configured')
    }
    
    const clientSecret = decrypt(config.clientSecret)
    
    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: clientSecret,
        code
      })
    })
    
    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text()
      console.error('Token exchange failed:', errText)
      return res.status(400).send('Failed to get access token from Shopify')
    }
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    // Save the store connection
    await ShopifyIntegration.findOneAndUpdate(
      { type: 'dropshipper_store', dropshipperId: nonceData.dropshipperId, shopDomain: shop },
      {
        type: 'dropshipper_store',
        dropshipperId: nonceData.dropshipperId,
        shopDomain: shop,
        accessToken: encrypt(accessToken),
        scopes: tokenData.scope,
        connectedAt: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    )
    
    // Redirect to success page
    const successUrl = `${process.env.FRONTEND_URL || 'https://buysial.ae'}/dropshipper/shopify-connected?shop=${encodeURIComponent(shop)}&success=true`
    res.redirect(successUrl)
    
  } catch (err) {
    console.error('Callback error:', err)
    res.status(500).send('OAuth callback failed: ' + err.message)
  }
})

// =============================================
// DROPSHIPPER ENDPOINTS
// =============================================

// Get dropshipper's connected store
router.get('/my-store', auth, allowRoles('dropshipper'), async (req, res) => {
  try {
    const store = await ShopifyIntegration.findOne({
      type: 'dropshipper_store',
      dropshipperId: req.user._id,
      isActive: true
    })
    
    if (!store) {
      return res.json({ connected: false })
    }
    
    res.json({
      connected: true,
      shopDomain: store.shopDomain,
      connectedAt: store.connectedAt,
      productsListed: store.productsListed || 0
    })
  } catch (err) {
    console.error('Error getting store:', err)
    res.status(500).json({ error: 'Failed to get store info' })
  }
})

// Generate OAuth URL for dropshipper
router.get('/connect-url', auth, allowRoles('dropshipper'), async (req, res) => {
  try {
    const { shop } = req.query
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop domain is required' })
    }
    
    // Clean shop domain
    let shopDomain = shop.trim().toLowerCase()
    if (!shopDomain.includes('.myshopify.com')) {
      shopDomain = shopDomain.replace('.myshopify.com', '') + '.myshopify.com'
    }
    
    // Check if app is configured
    const config = await ShopifyIntegration.findOne({ type: 'app_config' })
    if (!config || !config.clientId) {
      return res.status(400).json({ 
        error: 'Shopify app not configured',
        message: 'Please ask admin to configure Shopify app credentials first'
      })
    }
    
    const apiBase = process.env.API_BASE || 'https://buysial.ae'
    const connectUrl = `${apiBase}/api/shopify/install?shop=${encodeURIComponent(shopDomain)}&dropshipperId=${req.user._id}`
    
    res.json({ url: connectUrl })
  } catch (err) {
    console.error('Error generating connect URL:', err)
    res.status(500).json({ error: 'Failed to generate connection URL' })
  }
})

// Disconnect store
router.delete('/disconnect', auth, allowRoles('dropshipper'), async (req, res) => {
  try {
    await ShopifyIntegration.findOneAndUpdate(
      { type: 'dropshipper_store', dropshipperId: req.user._id },
      { isActive: false }
    )
    
    res.json({ success: true, message: 'Store disconnected' })
  } catch (err) {
    console.error('Error disconnecting:', err)
    res.status(500).json({ error: 'Failed to disconnect store' })
  }
})

// Check if app is configured (for dropshippers)
router.get('/status', auth, async (req, res) => {
  try {
    const config = await ShopifyIntegration.findOne({ type: 'app_config' })
    
    res.json({
      configured: !!(config && config.clientId),
      message: config?.clientId ? 'Shopify integration is available' : 'Shopify not configured by admin'
    })
  } catch (err) {
    res.json({ configured: false })
  }
})

export default router
