# 🔐 Environment Variable Configuration

This guide explains step by step how to configure the environment variables necessary for JobQuest to function correctly.

## 📍 Where to Configure

Environment variables are configured in a file named `.env.local` in the root of the project.

**⚠️ IMPORTANT:** This file MUST NOT be uploaded to Git (it is already in `.gitignore`).

## 🚀 Steps to Configure

### 1. Create the `.env.local` file

In the root of the project, create a file named `.env.local`:

```bash
# From the root of the project
touch .env.local
```

Or simply copy the example file:

```bash
cp .env.example .env.local
```

### 2. Obtain Supabase Credentials

#### Step 1: Create or Access your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Log in or create an account
3. Create a new project or select an existing one

#### Step 2: Obtain the URL and Anonymous Key

1. In your Supabase project, go to **Settings** in the sidebar
2. Click on **API**
3. You will find two important values:

   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
     - Example: `https://abcdefghijklmnop.supabase.co`
   
   - **anon public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - It is a long key starting with `eyJ...`

#### Step 3: Obtain the Service Role Key (Optional but Recommended)

1. In the same **Settings > API** page
2. Look for the **Project API keys** section
3. Click on **Reveal** next to `service_role` key
4. **⚠️ WARNING:** This key is very sensitive, never expose it in the frontend
5. Copy this key as `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Google OAuth (Optional but Necessary for Login)

For Google login to work:

1. In Supabase, go to **Authentication > Providers**
2. Enable **Google**
3. You will need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select an existing one
   - Go to **APIs & Services > Credentials**
   - Create OAuth 2.0 credentials
   - Add as authorized redirect URL:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret** to Supabase

### 4. Fill the `.env.local` file

Open the `.env.local` file and fill it with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1LXByb3llY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.your-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1LXByb3llY3RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Logo.dev API Configuration
LOGO_DEV_API_KEY=your-logo-dev-key-here
```

**Real example (do not use these values, they are just examples):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.example-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1MTkyMDAwLCJleHAiOjE5NjA3NjgwMDB9.example-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Configure the Database

After configuring the environment variables, you need to execute the SQL script:

1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy and paste the content of `supabase_setup.sql`
4. Execute the script
5. This will create:
   - The `profiles` table
   - The `avatars` storage bucket
   - Security policies (RLS)
   - Necessary triggers

### 6. Verify Configuration

After configuring everything, restart the development server:

```bash
# Stop the server (Ctrl+C) and start it again
npm run dev
```

If everything is configured correctly, you should be able to:
- See the landing page without errors
- Click "Sign in with Google" without console errors

## 🔍 Verify Variables are Loaded

You can verify that variables are loading correctly by checking the browser console. If there are Supabase-related errors, the variables are likely not configured correctly.

## 📝 Environment Variables Explained

### `NEXT_PUBLIC_SUPABASE_URL`
- **What it is:** Your Supabase project URL
- **Where used:** Client (browser) and server
- **Why `NEXT_PUBLIC_`:** Next.js only exposes variables starting with `NEXT_PUBLIC_` to the browser

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **What it is:** Your project's public/anonymous key
- **Where used:** Client (browser) and server
- **Security:** Safe to expose in frontend, has limited permissions

### `SUPABASE_SERVICE_ROLE_KEY`
- **What it is:** Service key with full permissions
- **Where used:** Only on server (server actions, API routes)
- **Security:** ⚠️ NEVER expose in frontend, has admin permissions

### `NEXT_PUBLIC_APP_URL`
- **What it is:** Your application URL
- **Where used:** For OAuth callbacks and redirects
- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`

### `GEMINI_API_KEY`
- **What it is:** Google Gemini API Key
- **Where used:** Only on server (API routes) to generate AI insights
- **How to obtain:**
  1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the generated key
- **Security:** ⚠️ NEVER expose in frontend, only used on server

### `GEMINI_MODEL` (Optional)
- **What it is:** The Gemini model to use
- **Possible values:**
  - `gemini-2.0-flash-exp` (default, faster and cheaper, experimental version)
  - `gemini-1.5-flash` (previous stable version)
  - `gemini-1.5-pro` (more powerful, better quality)
  - `gemini-pro` (previous version)
- **Where used:** Only on server to configure which model to use
- **Recommendation:** Use `gemini-2.0-flash-exp` for most cases (default), `gemini-1.5-pro` for more complex analysis

### `LOGO_DEV_API_KEY`
- **What it is:** Logo.dev public API key (publishable key) to extract company logos
- **Where used:** Only on server (API routes) to extract logos automatically
- **How to obtain:**
  1. Go to [Logo.dev](https://www.logo.dev/signup)
  2. Sign up or log in
  3. Go to your [API keys dashboard](https://www.logo.dev/dashboard/api-keys)
  4. Use the public key (`pk_`) - it is safe to use on server
  5. Copy the generated key (must start with `pk_`)
- **Format:** Key must start with `pk_` (publishable key)
- **Documentation:**
  - [docs.logo.dev](https://docs.logo.dev)
  - [Logo Images by Name](https://docs.logo.dev/logo-images/name)
- **Usage:** API searches logos by company name using: `https://img.logo.dev/name/{companyName}?token={api_key}`
- **Security:** Although a public key, it is used only on server to maintain security

## 🚨 Common Issues

### Error: "Missing Supabase environment variables"
- **Cause:** Variables are not configured or `.env.local` file does not exist
- **Solution:** Verify `.env.local` exists and has all variables

### Error: "Invalid API key"
- **Cause:** Keys are copied incorrectly or are from another project
- **Solution:** Verify you copied the correct keys from Supabase

### Variables not loading after creation
- **Cause:** Next.js needs restart to load new variables
- **Solution:** Stop server (Ctrl+C) and run `npm run dev` again

### Production Error
- **Cause:** Variables are not configured in hosting platform
- **Solution:** Configure environment variables in your platform (Vercel, Netlify, etc.)

### Rate Limiting (Optional - Production Only)

To use rate limiting with Redis in production, you need to configure Upstash Redis:

1. **Create Upstash account:**
   - Go to [https://upstash.com](https://upstash.com)
   - Create free account
   - Create new Redis database

2. **Obtain credentials:**
   - In Upstash dashboard, copy:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

3. **Add to `.env.local`:**
   ```bash
   # Rate Limiting (Optional - Production Only)
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

**Note:** If not configured, system uses memory store (development only). In production, Upstash Redis is recommended.

## Environment Variables for Email Notifications (Recommended)

### RESEND_API_KEY
- **Description:** Resend API Key for sending emails
- **Example:** `re_xxxxxxxxxxxxx`
- **Required:** Yes (for production)
- **How to obtain:**
  1. Create account at [Resend](https://resend.com)
  2. Go to API Keys in dashboard
  3. Create new API Key
  4. Copy key (starts with `re_`)
- **Usage:** Authentication to send transactional emails

### RESEND_FROM_EMAIL
- **Description:** Email from which emails are sent (must be verified in Resend)
- **Example:** `noreply@yourdomain.com` or `JobQuest <noreply@yourdomain.com>`
- **Required:** No (defaults to `onboarding@resend.dev` for testing)
- **Usage:** Sender email for all notifications
- **Note:** For production, verify a domain in Resend and use an email from that domain

### CRON_SECRET
- **Description:** Secret to authenticate cron job calls
- **Example:** `your-super-safe-secret-here`
- **Required:** No (only if using external cron jobs, not Vercel)
- **Usage:** Protect weekly digest and interview reminders endpoints

**Note:**
- In development without `RESEND_API_KEY`: emails will be logged in console
- In production: **MUST** configure `RESEND_API_KEY` for emails to be sent
- Resend offers 3,000 free emails/month, perfect for starting

## Environment Variables for Analytics (Optional)

### NEXT_PUBLIC_GTM_ID
- **Description:** Google Tag Manager Container ID
- **Example:** `GTM-MXDJ2NQV`
- **Required:** No
- **How to obtain:**
  1. Create account at [Google Tag Manager](https://tagmanager.google.com)
  2. Create new container for your website
  3. Copy Container ID (format: `GTM-XXXXXXX`)
- **Usage:** Event and conversion tracking via GTM. GTM allows managing multiple tools (GA4, Facebook Pixel, etc.) from one place
- **Recommended:** Yes, more flexible than direct Google Analytics

### NEXT_PUBLIC_GA_ID
- **Description:** Google Analytics 4 Measurement ID (only if NOT using GTM)
- **Example:** `G-XXXXXXXXXX`
- **Required:** No (only if not using GTM)
- **Usage:** Direct Google Analytics tracking (fallback if GTM not configured)

### NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- **Description:** Domain for Plausible Analytics (privacy-friendly)
- **Example:** `jobquest.app`
- **Required:** No
- **Usage:** Alternative analytics respecting privacy

### NEXT_PUBLIC_SENTRY_DSN
- **Description:** Sentry DSN for error tracking
- **Example:** `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **Required:** No
- **Usage:** Error tracking in production

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation on Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Resend - Email API](https://resend.com/docs)
- [SendGrid - Email API](https://docs.sendgrid.com/)
