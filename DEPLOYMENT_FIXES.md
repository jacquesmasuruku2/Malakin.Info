# Production Deployment Fixes

## Issues Fixed

### 1. CORS Error - API URL Configuration
**Problem**: The admin panel was trying to fetch from `localhost:3000` instead of the production domain, causing CORS errors.

**Fix**: Updated the default API URL in `admin-panel/src/lib/api.ts`:
```typescript
export function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://malakinfo.com';
  return `${baseUrl}${path}`;
}
```

**Files Modified**:
- `admin-panel/src/lib/api.ts`
- `admin-panel/src/app/page.tsx` (dashboard)
- `admin-panel/src/app/articles/page.tsx`
- `admin-panel/src/app/form-submissions/page.tsx`
- `admin-panel/src/app/job-applications/page.tsx`

### 2. BigInt Serialization Error
**Problem**: The `views` field in the Article model uses BigInt, which cannot be directly serialized to JSON, causing 500 errors.

**Fix**: Added BigInt to Number conversion in the articles API endpoint:
```typescript
const serializedArticles = articles.map(article => ({
  ...article,
  views: Number(article.views),
}));
```

**Files Modified**:
- `src/app/api/articles/route.ts`

### 3. JavaScript Error - Array Filter on Non-Array Data
**Problem**: When API calls failed, the frontend tried to call `.filter()` on non-array data, causing "N.filter is not a function" errors.

**Fix**: Added proper error handling and array validation:
```typescript
const data = await response.json();
setArticles(Array.isArray(data) ? data : []);
```

**Files Modified**:
- `admin-panel/src/app/articles/page.tsx`
- `admin-panel/src/app/form-submissions/page.tsx`
- `admin-panel/src/app/job-applications/page.tsx`

### 4. CORS Configuration Consistency
**Problem**: Some API endpoints had wildcard CORS (`*`) while others used specific origins, causing inconsistent behavior.

**Fix**: Standardized CORS configuration across all admin-facing API endpoints to use the specific admin panel domain:
```typescript
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
```

**Files Modified**:
- `src/app/api/articles/route.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/partnerships/route.ts`
- `src/app/api/job-applications/route.ts`
- `src/app/api/live/route.ts`
- `src/app/api/stats/route.ts`

## Deployment Instructions

### Environment Variables Required

For the **admin-panel**, ensure the following environment variable is set in production:
```
NEXT_PUBLIC_MAIN_SITE_URL=https://malakinfo.com
```

For the **main site**, ensure the following environment variables are set:
```
DATABASE_URL=<your-cockroachdb-connection-string>
```

### Deployment Steps

1. **Update Environment Variables**:
   - In your hosting platform (Vercel, Netlify, etc.), set the environment variables above
   - For Vercel: Go to Project Settings → Environment Variables

2. **Rebuild and Deploy**:
   ```bash
   # For main site
   cd arizona.info
   npm run build
   
   # For admin panel
   cd admin-panel
   npm run build
   ```

3. **Verify Deployment**:
   - Check that `https://dashboard.malakinfo.com/articles` loads without errors
   - Verify API calls are going to `https://malakinfo.com/api/*` not `localhost:3000`
   - Check browser console for any remaining CORS or JavaScript errors

### Testing Checklist

- [ ] Admin panel loads at `https://dashboard.malakinfo.com`
- [ ] Dashboard statistics display correctly
- [ ] Articles page loads and displays articles
- [ ] Categories page loads and displays categories
- [ ] Form submissions page loads without errors
- [ ] Job applications page loads without errors
- [ ] No CORS errors in browser console
- [ ] No "filter is not a function" errors
- [ ] No 500 errors from API endpoints

## Post-Deployment Monitoring

After deployment, monitor the following:
1. Browser console for any JavaScript errors
2. Network tab for failed API requests
3. Server logs for any database connection issues
4. CORS errors in the browser console

## Troubleshooting

### CORS Errors Still Occurring
- Verify `NEXT_PUBLIC_MAIN_SITE_URL` is set correctly in admin panel
- Check that API endpoints have the correct CORS headers
- Ensure the admin panel domain is `https://dashboard.malakinfo.com`

### 500 Errors on API Endpoints
- Check database connection in main site
- Verify BigInt fields are being converted to Numbers
- Check server logs for specific error messages

### Empty Data Displaying
- Verify API responses are returning arrays
- Check error handling in frontend components
- Ensure network requests are completing successfully