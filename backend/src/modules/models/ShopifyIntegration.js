import mongoose from 'mongoose'

const shopifyIntegrationSchema = new mongoose.Schema({
  // Type: 'app_config' for admin settings, 'dropshipper_store' for individual stores
  type: {
    type: String,
    enum: ['app_config', 'dropshipper_store', 'legacy'],
    default: 'legacy'
  },
  
  // For app_config type
  clientId: String,
  clientSecret: String, // encrypted
  scopes: String,
  
  // For dropshipper_store type
  dropshipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Legacy support - keep for old integration
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Store 