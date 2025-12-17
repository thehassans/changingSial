## 🔴 CRITICAL FIX NEEDED

**Problem:** Double `@` in MongoDB URI

**Current (WRONG):**
```
mongodb+srv://Vercel-Admin-buysialsite:Hassan123@@buysialsite.p0usujr.mongodb.net/?appName=buysialsite
                                                    ^^
                                                  EXTRA @
```

**Correct (FIX):**
```
mongodb+srv://Vercel-Admin-buysialsite:Hassan123@buysialsite.p0usujr.mongodb.net/?appName=buysialsite
                                                   ^
                                                 SINGLE @
```

## How to Fix in Plesk

1. **Go to:** Plesk Panel → Websites & Domains → hassanscode.com
2. **Click:** Your Node.js application
3. **Edit:** Custom environment variables
4. **Find:** `MONGO_URI`
5. **Change:** Remove the extra `@` (Hassan123@@buysialsite → Hassan123@buysialsite)
6. **Click:** OK/Apply7. **Restart:** Click "Restart App" button

## Verify Fix

After restart, check:
```bash
curl -s https://hassanscode.com/api/health | jq '.db'
```

Should return:
```json
{
  "state": 1,
  "label": "connected"
}
```

Then the "Connection issue" button will disappear from the login page.
