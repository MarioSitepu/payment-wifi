#!/bin/bash

# Setup PostgreSQL untuk Production Deployment
echo "🚀 Setting up PostgreSQL for production..."

# Generate NEXTAUTH_SECRET
echo ""
echo "🔐 Generate NEXTAUTH_SECRET:"
openssl rand -base64 32

echo ""
echo "✅ Copy NEXTAUTH_SECRET di atas ke Vercel Environment Variables"
echo ""
echo "📝 Setup Environment Variables di Vercel:"
echo "DATABASE_URL=postgresql://username:password@host:5432/database"
echo "NEXTAUTH_URL=https://your-app.vercel.app"
echo "NEXTAUTH_SECRET=<paste-secret-from-above>"
echo ""
echo "✅ Done!"


