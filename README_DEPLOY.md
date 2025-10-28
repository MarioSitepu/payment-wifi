# 🚀 Cara Deploy dengan Login Admin

## Quick Start

### 1. Setup Database PostgreSQL (Pilih salah satu)

**Neon (Paling Mudah - Gratis)**
- Kunjungi: https://neon.tech
- Sign up → Create project
- Copy connection string

**Vercel Postgres (Integrasi Langsung)**
- Di Vercel Dashboard → Add Integration → Postgres
- Otomatis dapat DATABASE_URL

### 2. Tambahkan Environment Variables di Vercel

Di Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@host/database
NEXTAUTH_URL=https://payment-wifi.vercel.app
NEXTAUTH_SECRET=<generate-secret-di-bawah>
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 3. Setup Database Schema

Di terminal local Anda, jalankan:

```bash
# Set DATABASE_URL ke PostgreSQL
export DATABASE_URL="postgresql://..."
# Atau di Windows:
# set DATABASE_URL=postgresql://...

# Push schema ke database
npx prisma db push
```

### 4. Create Admin User

**Di terminal, jalankan:**

```bash
# Pastikan DATABASE_URL sudah set ke PostgreSQL
npm run db:create-admin
```

**Atau manual:**
```bash
DATABASE_URL="postgresql://..." npx tsx scripts/create-admin-postgres.ts
```

### 5. Deploy ke Vercel

```bash
git add .
git commit -m "Setup PostgreSQL for production"
git push
```

Vercel akan auto-deploy!

### 6. Login Admin

Setelah deploy selesai:
1. Buka https://payment-wifi.vercel.app/auth/signin
2. Login dengan:
   - **Email:** admin@example.com
   - **Password:** admin123

## 🔑 Admin Credentials

```
Email: admin@example.com
Password: admin123
```

⚠️ **PENTING:** Ganti password setelah login pertama!

## 📚 Dokumentasi Lengkap

Lihat file `DEPLOY_PANDUAN.md` untuk penjelasan lengkap.

## ❓ Masalah?

**Error: Cannot connect to database**
- Pastikan DATABASE_URL sudah benar
- Check database logs di Neon/Supabase

**Error: 401 Unauthorized**
- Pastikan admin user sudah di-create
- Jalankan: `npm run db:create-admin`

**Error: NEXTAUTH_SECRET not found**
- Tambahkan NEXTAUTH_SECRET di Vercel
- Redeploy project

## ✅ Done!

Sekarang aplikasi sudah siap digunakan di production dengan PostgreSQL!


