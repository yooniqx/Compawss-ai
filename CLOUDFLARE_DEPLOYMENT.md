# Cloudflare Pages Deployment Guide

This guide will help you deploy Compawss AI frontend to Cloudflare Pages.

## Prerequisites

- Cloudflare account ([Sign up here](https://dash.cloudflare.com/sign-up))
- GitHub repository connected
- All environment variables ready

---

## Method 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Access Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **"Workers & Pages"** in the left sidebar
3. Click **"Create application"**
4. Select **"Pages"** tab
5. Click **"Connect to Git"**

### Step 2: Connect GitHub Repository

1. Click **"Connect GitHub"** (or GitLab/Bitbucket)
2. Authorize Cloudflare to access your GitHub account
3. Select your repository: **`yooniqx/Compawss-ai`**
4. Click **"Begin setup"**

### Step 3: Configure Build Settings

Enter the following configuration:

**Project name:** `compawss-ai` (or your preferred name)

**Production branch:** `main`

**Build settings:**
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty or use `/`)

**Node.js version:** `18` or higher

### Step 4: Add Environment Variables

Click **"Add environment variable"** and add the following:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `VITE_BACKEND_URL` | Your backend URL | e.g., `https://your-backend.onrender.com` |
| `VITE_SUPABASE_URL` | Your Supabase URL | From Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | From Google Cloud Console |

**Important:** All environment variables must start with `VITE_` to be accessible in the frontend.

### Step 5: Deploy

1. Click **"Save and Deploy"**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your project (`npm run build`)
   - Deploy to Cloudflare's global CDN

3. Wait for the build to complete (usually 2-5 minutes)

### Step 6: Access Your Deployment

Once deployed, you'll get a URL like:
```
https://compawss-ai.pages.dev
```

You can also add a custom domain in the **"Custom domains"** section.

---

## Method 2: Deploy via Wrangler CLI

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### Step 3: Build Your Project

```bash
npm run build
```

### Step 4: Deploy

```bash
wrangler pages deploy dist --project-name=compawss-ai
```

### Step 5: Set Environment Variables

```bash
wrangler pages secret put VITE_BACKEND_URL --project-name=compawss-ai
wrangler pages secret put VITE_SUPABASE_URL --project-name=compawss-ai
wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name=compawss-ai
wrangler pages secret put VITE_GOOGLE_MAPS_API_KEY --project-name=compawss-ai
```

You'll be prompted to enter each value.

---

## Post-Deployment Configuration

### 1. Update Backend CORS

Add your Cloudflare Pages URL to your backend's CORS allowed origins:

```python
# In backend/main_grounded.py
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://compawss-ai.pages.dev",  # Add this
    "https://your-custom-domain.com",  # If using custom domain
]
```

### 2. Configure Custom Domain (Optional)

1. Go to your Cloudflare Pages project
2. Click **"Custom domains"**
3. Click **"Set up a custom domain"**
4. Enter your domain (e.g., `compawss.ai`)
5. Follow the DNS configuration instructions

### 3. Enable HTTPS

Cloudflare automatically provides SSL/TLS certificates. Ensure:
- **Always Use HTTPS** is enabled
- **Automatic HTTPS Rewrites** is enabled

### 4. Configure Redirects (Optional)

Create a `_redirects` file in your `public/` folder:

```
# Redirect all routes to index.html for SPA
/*    /index.html   200
```

---

## Continuous Deployment

Once connected to GitHub, Cloudflare Pages will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show build logs and deployment status

### Trigger Manual Deployment

1. Go to your Cloudflare Pages project
2. Click **"Deployments"**
3. Click **"Create deployment"**
4. Select branch and click **"Deploy"**

---

## Monitoring & Analytics

### View Deployment Logs

1. Go to your project in Cloudflare Pages
2. Click **"Deployments"**
3. Click on any deployment to view logs

### Enable Web Analytics

1. Go to **"Analytics"** tab
2. Enable **"Web Analytics"**
3. View traffic, performance, and user metrics

---

## Troubleshooting

### Build Fails

**Issue:** Build command fails
**Solution:** 
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Environment Variables Not Working

**Issue:** App can't access environment variables
**Solution:**
- Ensure all variables start with `VITE_`
- Redeploy after adding/changing variables
- Check variable names match exactly

### 404 Errors on Routes

**Issue:** Direct URL access returns 404
**Solution:**
- Add `_redirects` file (see above)
- Or configure in Cloudflare Pages settings

### CORS Errors

**Issue:** API requests blocked by CORS
**Solution:**
- Add Cloudflare Pages URL to backend CORS origins
- Ensure backend is deployed and accessible

---

## Performance Optimization

### Enable Caching

Cloudflare automatically caches static assets. Configure cache rules:

1. Go to **"Caching"** in Cloudflare dashboard
2. Set cache rules for static assets
3. Enable **"Browser Cache TTL"**

### Enable Minification

1. Go to **"Speed"** → **"Optimization"**
2. Enable:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - Early Hints

### Enable Argo Smart Routing (Optional)

For faster global performance:
1. Go to **"Traffic"** → **"Argo"**
2. Enable **"Argo Smart Routing"**
3. This routes traffic through Cloudflare's fastest paths

---

## Rollback Deployment

If something goes wrong:

1. Go to **"Deployments"**
2. Find a previous working deployment
3. Click **"..."** → **"Rollback to this deployment"**

---

## Cost

Cloudflare Pages is **FREE** for:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 build at a time

**Pro Plan** ($20/month) includes:
- 5,000 builds per month
- 5 concurrent builds
- Advanced analytics

---

## Support

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Community Forum:** https://community.cloudflare.com/
- **Status Page:** https://www.cloudflarestatus.com/

---

## Next Steps

After successful deployment:

1. ✅ Test all features on production URL
2. ✅ Update README with production URL
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring and alerts
5. ✅ Enable Web Analytics
6. ✅ Share your deployed app!

---

**Deployment URL:** `https://compawss-ai.pages.dev`

**Custom Domain:** Configure in Cloudflare Pages dashboard

**Build Time:** ~2-5 minutes

**Global CDN:** Deployed to 300+ cities worldwide

---

*For issues or questions, contact: dbose0906@gmail.com*