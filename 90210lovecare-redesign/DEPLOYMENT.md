# Deployment Guide - 90210 Love Care Website

This guide covers deployment options for the 90210 Love Care website.

## Build for Production

Before deploying, create a production build:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Netlify (Recommended)

Netlify offers free hosting with automatic deployments from Git.

1. **Sign up** at [netlify.com](https://www.netlify.com)
2. **Connect your repository** or drag & drop the `dist` folder
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy** - Your site will be live at a Netlify URL

**Custom Domain**: Configure in Netlify's Domain settings

**Environment Variables**: None required for this static site

### Option 2: Vercel

Vercel is optimized for React applications.

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import project** from Git repository
3. **Framework**: Vite will be auto-detected
4. **Deploy** - Automatic deployments on every push

### Option 3: GitHub Pages

Free hosting directly from a GitHub repository.

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/90210lovecare",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure** repository settings to use gh-pages branch

### Option 4: AWS S3 + CloudFront

For enterprise-level hosting with CDN.

1. **Build** the production version:
   ```bash
   npm run build
   ```

2. **Create S3 bucket** for static website hosting

3. **Upload** the `dist/` folder contents to S3

4. **Configure** CloudFront for CDN distribution

5. **Set up** Route 53 for custom domain

### Option 5: Traditional Web Hosting

Upload to any web host via FTP/SFTP.

1. **Build** production version
2. **Upload** all files from `dist/` to your web host's public directory
3. **Configure** your domain to point to the hosting

## Post-Deployment Checklist

- [ ] Test all pages and navigation
- [ ] Verify contact form (integrate with backend)
- [ ] Check mobile responsiveness
- [ ] Test click-to-call phone links
- [ ] Verify all images load correctly
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Check page load speed with Lighthouse
- [ ] Set up Google Analytics (optional)
- [ ] Submit sitemap to Google Search Console
- [ ] Test accessibility with screen readers

## Custom Domain Setup

### DNS Configuration

Point your domain to the hosting service:

**For Netlify/Vercel**:
- A Record: Points to their IP
- CNAME: www points to your deployment URL

**For CloudFront**:
- A Record (Alias): Points to CloudFront distribution
- CNAME: www points to CloudFront domain

### SSL Certificate

All recommended platforms (Netlify, Vercel, CloudFront) provide free SSL certificates automatically.

## Performance Optimization

The build is already optimized with:
- Code splitting
- Minification
- Tree shaking
- Optimized images

Additional optimizations:
- Enable gzip compression on server
- Set proper cache headers
- Use a CDN for assets
- Lazy load images below the fold

## Monitoring & Analytics

### Recommended Tools

1. **Google Analytics** - Track visitors and behavior
2. **Hotjar** - Heatmaps and session recordings
3. **Google Search Console** - SEO monitoring
4. **PageSpeed Insights** - Performance monitoring

### Integration

Add tracking code to `index.html` before the closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Backend Integration

The contact form currently only logs to console. To make it functional:

### Option 1: Formspree
```jsx
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  {/* form fields */}
</form>
```

### Option 2: Netlify Forms
Add `data-netlify="true"` to the form tag:
```jsx
<form name="contact" method="POST" data-netlify="true">
  {/* form fields */}
</form>
```

### Option 3: Custom Backend
Create an API endpoint and update the `handleSubmit` function in `Contact.jsx`

## Environment-Specific Configuration

Create `.env` files for different environments:

**.env.production**:
```
VITE_API_URL=https://api.90210lovecare.com
VITE_GA_ID=GA_MEASUREMENT_ID
```

**.env.development**:
```
VITE_API_URL=http://localhost:3000
VITE_GA_ID=
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL;
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## Troubleshooting

**404 Errors on Refresh**: Configure your hosting for SPA routing
- Netlify: Add `_redirects` file with `/* /index.html 200`
- Vercel: Auto-configured
- Apache: Use `.htaccess` with RewriteRules

**Build Errors**:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

**Slow Load Times**:
- Enable CDN
- Optimize images
- Check bundle size: `npm run build -- --mode analyze`

## Support

For deployment issues, consult:
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- Platform-specific documentation
- Development team support
