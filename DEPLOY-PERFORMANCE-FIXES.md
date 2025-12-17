# Deployment Performance Fixes

## 🚀 Optimization Applied

**Issue:** The site was taking time to load ("Loading store...") when accessing `hassanscode.com`.
**Cause:** The application was checking if `hassanscode.com` was a custom client store every time, triggering an unnecessary API call.

### ✅ Fixes Implemented

1.  **Instant Loading for Main Domain:**
    - Modified `src/App.jsx` to recognize `hassanscode.com` (and `www.`) as the main platform.
    - **Result:** The app now skips the API check and loads instantly.

2.  **UI Responsiveness:**
    - Updated the "Loading store..." screen.
    - **Change:** Replaced the plain text loader with a modern, centered spinner that looks good on mobile and desktop.
    - **Code:**
      ```jsx
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner border-4 border-gray-300 border-t-primary w-8 h-8 rounded-full animate-spin" />
          <div className="font-medium animate-pulse">Loading store...</div>
        </div>
      </div>
      ```

3.  **Code Pushed:**
    - Changes have been pushed to the `main` branch of your repository.
    - **Commit:** `fix: optimize app loading performance and responsiveness`

## 📲 How to Deploy

Since the code is pushed, you just need to pull and rebuild on your server:

```bash
# On your Plesk server
cd /var/www/vhosts/hassanscode.com/httpdocs/frontend
git pull
npm install
npm run build
```
