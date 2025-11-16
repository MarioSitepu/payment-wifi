#!/bin/bash

echo "🚀 NEON POSTGRESQL DEPLOYMENT SCRIPT"
echo "=================================="

# Step 1: Push schema ke Dev Branch (Development)
echo ""
echo "📝 Step 1: Push schema ke Dev Branch (Development)"
echo "DATABASE_URL=\"postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require\" npx prisma db push"

# Step 2: Push schema ke Main Branch (Production)
echo ""
echo "📝 Step 2: Push schema ke Main Branch (Production)"
echo "DATABASE_URL=\"postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require\" npx prisma db push"

# Step 3: Generate Prisma Client
echo ""
echo "📝 Step 3: Generate Prisma Client"
echo "npx prisma generate"

# Step 4: Test Prisma Studio
echo ""
echo "📝 Step 4: Test dengan Prisma Studio"
echo "npx prisma studio --browser none"

echo ""
echo "✅ SETUP LOKAL SELESAI!"
echo ""
echo "🔗 LANGKAH SELANJUTNYA DI VERCEL:"
echo "1. Buka: https://vercel.com/dashboard"
echo "2. Pilih project → Settings → Environment Variables"
echo "3. Setup Production Environment:"
echo "   DATABASE_URL = postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "   NEXTAUTH_SECRET = aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8="
echo "   NEXTAUTH_URL = https://your-app.vercel.app"
echo ""
echo "4. Setup Development Environment:"
echo "   DATABASE_URL = postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "   NEXTAUTH_SECRET = aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8="
echo "   NEXTAUTH_URL = https://your-app-dev.vercel.app"
echo ""
echo "5. Deploy:"
echo "   git add ."
echo "   git commit -m \"Setup Neon PostgreSQL deployment\""
echo "   git push origin main"
echo ""
echo "🎉 READY TO DEPLOY!"

