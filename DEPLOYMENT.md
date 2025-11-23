# Vercel Deployment Guide

## Prerequisites

1. **AlphaVantage API Key**
   - Get your free API key from: https://www.alphavantage.co/support/#api-key
   - Free tier: 5 API calls/minute, 500 calls/day

## Vercel Environment Variables

In your Vercel project dashboard, add the following environment variable:

```
alphaVantage_key = YOUR_API_KEY_HERE
```

**Important:** Make sure to add it for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

## Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel dashboard
3. Add environment variable `alphaVantage_key`
4. Deploy

## Caching Configuration

This app uses **Incremental Static Regeneration (ISR)** to cache data for 1 hour:

```typescript
export const config = {
  isr: {
    expiration: 3600 // 1 hour cache
  }
};
```

**Why caching is critical:**
- You make 5 API calls per page load
- AlphaVantage free tier: 5 calls/minute limit
- Without caching, 2 visitors per minute = rate limit exceeded
- With 1-hour cache, first visitor fetches data, next visitors get cached version

## Cache Headers

The app also sets HTTP cache headers:

```
cache-control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
```

- `max-age=3600`: Browser caches for 1 hour
- `s-maxage=3600`: CDN caches for 1 hour  
- `stale-while-revalidate=86400`: Serve stale content while revalidating (24 hours)

## Troubleshooting

### Data Not Loading on Vercel

1. **Check Function Logs:**
   - Vercel Dashboard → Your Project → Functions → Logs
   - Look for `[API Debug]` messages showing raw API responses
   - Look for `[API Rate Limit]` warnings

2. **Common Issues:**

   **Rate Limit Exceeded:**
   ```json
   {
     "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute..."
   }
   ```
   **Solution:** Wait 1 minute and refresh. ISR caching will prevent this after first load.

   **Invalid API Key:**
   ```json
   {
     "Error Message": "Invalid API call. Please retry or visit the documentation..."
   }
   ```
   **Solution:** Verify `alphaVantage_key` is set correctly in Vercel environment variables.

   **Missing Environment Variable:**
   ```
   AlphaVantage API error: ...
   ```
   **Solution:** Add `alphaVantage_key` in Vercel dashboard and redeploy.

3. **Verify Environment Variable:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure `alphaVantage_key` is present and has no extra spaces
   - Redeploy after adding/updating variables

### Build Errors on Windows

If you see symlink errors when building locally on Windows:
```
Error: EPERM: operation not permitted, symlink...
```

This is a Windows-specific issue and **won't affect Vercel deployment** (Vercel builds on Linux). You can safely ignore it or:
- Run as Administrator
- Use WSL2 for local builds
- Just push to Vercel and let it build there

## Performance Notes

- **First Load:** ~2-5 seconds (fetching from 5 APIs)
- **Cached Loads:** <500ms (served from Vercel Edge Network)
- **Chart Rendering:** Client-side with ApexCharts
- **Bundle Size:** ~580KB (ApexCharts library)

## Monitoring

Check these metrics in Vercel:
- **Function Duration:** Should be 2-5s on first load, 0s on cached
- **Bandwidth:** ~600KB per page view
- **Function Invocations:** Should be low due to caching

## Upgrading API Limits

If you need more frequent updates or higher traffic:

**AlphaVantage Premium Plans:**
- **Premium:** 75 calls/minute, $50/month
- **Enterprise:** Custom limits, custom pricing

**Alternative:** Consider switching to a different data provider with higher free tier limits.

