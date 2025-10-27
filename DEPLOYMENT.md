# 🚀 Deployment Guide untuk Vercel

## 📊 Informasi PostgreSQL untuk Cloud

### Versi PostgreSQL yang Digunakan Provider Cloud:

| Provider | PostgreSQL Version | Free Tier | Rekomendasi |
|----------|-------------------|-----------|-------------|
| **Neon** | **PostgreSQL 16** ⭐ | ✅ (Generous) | ⭐⭐⭐⭐⭐ Terbaik |
| **Supabase** | PostgreSQL 15 | ✅ (500MB) | ⭐⭐⭐⭐ Bagus |
| **Vercel Postgres** | PostgreSQL 15 | ❌ (Free trial) | ⭐⭐⭐ Ketat |
| **Railway** | PostgreSQL 15/16 | ✅ (Limited) | ⭐⭐⭐ Opsional |

**Rekomendasi Saya:**
- **Pilih Neon** (https://neon.tech) - PostgreSQL 16 terbaru, free tier 0.5GB, cocok untuk production

## Masalah yang Terjadi

Error di `/api/auth/error` terjadi karena:
1. **SQLite tidak kompatibel dengan Vercel** - Vercel bersifat serverless dan read-only filesystem
2. **Missing Environment Variables** - NEXTAUTH_SECRET dan NEXTAUTH_URL tidak dikonfigurasi

## ✅ Solusi untuk Deploy ke Vercel

### 1. Setup Database PostgreSQL Cloud

SQLite **TIDAK** berfungsi di Vercel. Anda perlu menggunakan database cloud seperti:

- **Option 1: Neon** ⭐ **RECOMMENDED** - PostgreSQL 16 (free tier)
- **Option 2: Supabase** - PostgreSQL 15 (free tier)
- **Option 3: Vercel Postgres** - PostgreSQL 15 (paid)
- **Option 4: Railway** - PostgreSQL 15/16 (free tier terbatas)

### 2. Setup Environment Variables di Vercel

Tambahkan environment variables berikut di Vercel Dashboard:

#### Di Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://payment-wifi.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
```

**Cara Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Update Prisma Schema untuk PostgreSQL

✅ **SUDAH DILAKUKAN!** Schema Prisma sudah diupdate dari SQLite ke PostgreSQL.

Schema sekarang menggunakan:
```prisma
datasource db {
  provider = "postgresql"  // ✅ Sudah diubah dari "sqlite"
  url      = env("DATABASE_URL")
}
```

### 4. Cara Cepat Setup dengan Neon (Gratis) ⭐ RECOMMENDED

1. **Kunjungi https://neon.tech** dan sign up (gratis)
2. Buat project baru, pilih region terdekat (contoh: Singapore)
3. **Copy connection string** yang terlihat seperti:
   ```
   postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Paste ke Vercel Environment Variables** sebagai `DATABASE_URL`
5. Setup environment variables lainnya (NEXTAUTH_SECRET, NEXTAUTH_URL)
6. Deploy ulang di Vercel

### 5. Setup dengan Supabase (Alternatif)

1. Kunjungi https://supabase.com
2. Create new project, pilih PostgreSQL database
3. Settings → Database → Connection string
4. Copy connection string dengan SSL mode
5. Paste ke Vercel sebagai `DATABASE_URL`

## 📝 Checklist Deploy

- [x] ✅ Update Prisma schema dari SQLite ke PostgreSQL (SUDAH DILAKUKAN)
- [ ] Setup database cloud PostgreSQL (Neon/Supabase)
- [ ] Setup DATABASE_URL di Vercel
- [ ] Setup NEXTAUTH_URL di Vercel
- [ ] Setup NEXTAUTH_SECRET di Vercel
- [ ] Run `npx prisma generate` (local untuk test)
- [ ] Run `npx prisma db push` (akan otomatis saat deploy)
- [ ] Push ke GitHub dan deploy ulang di Vercel

## 🛠️ Command untuk Setup Local PostgreSQL

Jika mau test database PostgreSQL secara lokal:

```bash
# 1. Generate Prisma Client untuk PostgreSQL
npx prisma generate

# 2. Push schema ke database (untuk development)
npx prisma db push

# 3. Untuk production, gunakan migrate
npx prisma migrate deploy
```

## 🔑 Default Login Credentials

Setelah deploy:
- Admin: admin@example.com / admin123

Jika ingin create user baru, register di `/auth/signup`

