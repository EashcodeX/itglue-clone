@echo off
echo ========================================
echo   ITGlue Clone - Netlify Deployment
echo ========================================
echo.

echo Creating deployment package...
powershell -Command "Compress-Archive -Path * -DestinationPath ../itglue-clone-dist.zip -Force"

echo.
echo ✅ Deployment package created: itglue-clone-dist.zip
echo.
echo 🚀 Next steps:
echo 1. Go to https://netlify.com
echo 2. Drag and drop the itglue-clone-dist.zip file
echo 3. Add environment variables in site settings
echo 4. Your ITGlue clone will be live!
echo.
echo 📋 Environment Variables to add:
echo NEXT_PUBLIC_SUPABASE_URL=https://rygswrlmtwaareqfxnxk.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
echo SUPABASE_SERVICE_ROLE_KEY=your-service-key
echo NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
echo.
pause
