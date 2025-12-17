# Quick Reference: iOS Build Commands

## Standard Build Process

```bash
cd /Users/hassansarwar/Desktop/changing\ buysial/changingbuysial/frontend

# 1. Build React app  
npm run build

# 2. Copy to iOS (workaround for sync issues)
cp -R dist/* ios/App/App/public/

# 3. Open in Xcode
npx cap open ios
```

## In Xcode

1. **Select Team**: Signing & Capabilities tab
2. **Connect iPhone**: USB cable, trust computer
3. **Select Device**: Top toolbar dropdown
4. **Run**: Click ▶️ or Cmd+R

## First Time on Device

Settings > General > VPN & Device Management > Trust Developer

## Production API

The app connects to: `https://web.buysial.com`
