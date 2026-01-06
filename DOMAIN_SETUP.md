# Domain Setup - www.brickcheck.app

## Live URL

The application is now live at: **https://www.brickcheck.app**

## Environment Variables Updated

✅ **Production**: `NEXT_PUBLIC_APP_URL=https://www.brickcheck.app`
- Updated in Vercel environment variables
- All documentation references updated

## Domain Configuration

The domain `www.brickcheck.app` should be configured in Vercel:

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. Add `www.brickcheck.app` as a custom domain
3. Follow DNS configuration instructions from Vercel
4. SSL certificate will be automatically provisioned

## Verification

To verify the domain is working:
- Visit: https://www.brickcheck.app
- Check that the app loads correctly
- Verify HTTPS is working (required for camera access)
- Test authentication and core features

## Next Steps

1. ✅ Domain added to Vercel
2. ✅ Environment variables updated
3. ⏳ Configure DNS records (if not already done)
4. ⏳ Verify SSL certificate is active
5. ⏳ Test all features on live domain

## Important Notes

- The app requires HTTPS for camera/barcode scanning
- All API routes will use the `NEXT_PUBLIC_APP_URL` environment variable
- OAuth redirects (if added) should use this domain
- Email links (if added) should use this domain






