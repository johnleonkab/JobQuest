# 🔧 Fix: Supabase Redirects to Localhost in Production

## 🎯 The Problem

After Google login, Supabase redirects to `localhost:3000` instead of your Vercel domain. This happens because Supabase's **Site URL** is configured to localhost.

## ✅ Solution: Update Supabase Configuration

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Authentication** in the left sidebar
3. Click on **URL Configuration**

### Step 2: Update Site URL

**This is the most important setting!**

1. Find the **Site URL** field
2. Change it from:
   ```
   http://localhost:3000
   ```
   To your production domain:
   ```
   https://your-app.vercel.app
   ```
   (Replace `your-app.vercel.app` with your actual Vercel domain)

3. **Click Save**

⚠️ **Why this matters:** Supabase uses the Site URL as the default redirect destination after authentication. If it's set to localhost, it will always redirect there, even in production.

### Step 3: Update Redirect URLs

In the same page, find the **Redirect URLs** section:

1. **Add your production URL:**
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

2. **Keep localhost for development (optional):**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

3. **Click Save**

### Step 4: Verify in Code

The code in `src/lib/auth/actions.ts` now automatically detects the URL from the request headers, so it should work correctly. However, you can also:

1. **Set `NEXT_PUBLIC_APP_URL` in Vercel** (recommended):
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
   - Select: Production, Preview, Development
   - Redeploy

## 📋 Quick Checklist

- [ ] Supabase Site URL changed to your Vercel domain
- [ ] Redirect URLs include your Vercel domain
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel (optional but recommended)
- [ ] Redeployed after changes

## 🐛 Still Not Working?

1. **Clear browser cache** or use incognito mode
2. **Check Supabase logs** in Authentication → Logs
3. **Verify the redirect URL** in the OAuth flow matches your Vercel domain
4. **Test the callback URL** directly: `https://your-app.vercel.app/auth/callback`

## 📸 Where to Find It

**Supabase Dashboard Path:**
```
Your Project → Authentication → URL Configuration
```

**Vercel Environment Variables Path:**
```
Your Project → Settings → Environment Variables
```

---

**The key fix is changing the Site URL in Supabase from localhost to your production domain!**

