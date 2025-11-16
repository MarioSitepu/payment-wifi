# 🚀 Quick Start: Deploy dengan Neon PostgreSQL 16

## ✅ Yang Sudah Dilakukan

1. ✅ **Schema Prisma** sudah diupdate ke PostgreSQL
2. ✅ **Prisma Client** sudah di-generate untuk PostgreSQL
3. ✅ **Secret Key** sudah di-generate: `aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=`

## 🎯 Yang Perlu Anda Lakukan

### Step 1: Buat Neon Account (2 menit)

1. Kunjungi: https://neon.tech/signup
2. Sign up dengan GitHub/Google/Email (gratis)
3. Login ke dashboard

### Step 2: Buat Project Neon (1 menit)

1. Klik **"Create Project"**
2. Nama: `payment-wifi`
3. Region: Pilih **Singapore** (latency terbaik)
4. PostgreSQL Version: **16** (otomatis latest)
5. Klik **"Create Project"**

### Step 3: Setup Branches (2 menit)

**Branch Main (Production)** sudah otomatis dibuat dengan nama `main`.

**Buat Branch Dev (Development):**
1. Di sidebar → **"Branches"**
2. Klik **"New Branch"**
3. Name: `dev`
4. Parent: `main`
5. Create from: **"Create empty"**
6. Klik **"Create Branch"**

**Hasil:**
- **Main branch** → Database `neondb` (untuk production)
- **Dev branch** → Database `dev` (untuk development)

### Step 4: Copy Connection Strings (1 menit)

#### ✅ Main Branch (Production) - SUDAH ADA:
```
postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### ✅ Dev Branch (Development) - SUDAH BENAR:
```
postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Database name `neondb` adalah DEFAULT untuk semua branches dan TIDAK perlu diubah!** 🎉

### Step 5: Setup Environment Variables

#### A. Untuk Local Development

Buat file `.env` di root project:

```env
# ✅ Development dengan Dev Branch (recommended untuk testing)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8="
NEXTAUTH_URL="http://localhost:3000"

# Production Branch (hanya jika perlu testing production data):
# DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

#### B. Untuk Vercel Production

1. Buka: https://vercel.com/dashboard
2. Pilih project → **Settings** → **Environment Variables**
3. Tambahkan:

**Production Environment:**
```
DATABASE_URL = postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET = aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=
NEXTAUTH_URL = https://your-app.vercel.app
```

**Development Environment:**
```
DATABASE_URL = postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET = aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=
NEXTAUTH_URL = https://your-app-development.vercel.app
```

### Step 6: Test Database Connection

```bash
# ✅ Test dengan Dev Branch (recommended untuk development)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push

# ✅ Test dengan Main Branch (production)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push

# Buka Prisma Studio untuk lihat database
npx prisma studio --browser none
```

Jika berhasil, akan muncul tabel di Prisma Studio! 🎉

### Step 7: Deploy ke Vercel

```bash
# Commit perubahan
git add .
git commit -m "Setup Neon PostgreSQL with branches"
git push origin main
```

Vercel akan otomatis deploy!

## 📋 Checklist

- [x] ✅ Neon account sudah dibuat
- [x] ✅ Project Neon sudah dibuat (Singapore region, PostgreSQL 16)
- [x] ✅ Branch Main (production) sudah ada dengan connection string
- [x] ✅ Branch Dev (development) sudah dibuat
- [x] ✅ Connection strings dari kedua branches sudah di-copy (database name `neondb` untuk semua)
- [x] ✅ File `.env` sudah dibuat dengan DATABASE_URL dev branch
- [ ] Environment variables perlu ditambahkan di Vercel (Production + Development)
- [ ] `npx prisma db push` perlu dijalankan untuk kedua branches
- [ ] `npx prisma studio` perlu ditest
- [ ] Deploy ke Vercel perlu dilakukan
- [ ] Aplikasi perlu ditest registrasi/login

## 🎉 Setelah Setup

Setelah semuanya jalan:

### Development Environment:
1. **Test di Development dulu:**
   - Buka: `https://your-app-development.vercel.app`
   - Test registrasi user baru di dev environment
   - Test login dan fitur lainnya

### Production Environment:
2. **Test Production:**
   - Buka: `https://your-app.vercel.app`
   - Test dengan data production
   - Login dengan admin account

3. **Default Admin:**
   - Email: `admin@example.com`
   - Password: `admin123`

## 📊 Monitor Database

- **Neon Dashboard:** https://console.neon.tech
- **Main Branch:** Monitor production usage
- **Dev Branch:** Monitor development usage
- **Storage:** 512 MB per branch (1 GB total untuk 2 branches)

## 🌿 Branch Management

### Reset Dev Branch (jika perlu):
1. Neon Dashboard → Branches → Dev
2. Klik **"Reset"** → **"Create empty"**
3. Run: `npx prisma db push`

### Sync Dev dengan Production:
1. Reset dev branch
2. Pilih **"Copy data from main"** saat reset
3. Push schema lagi

## 🐛 Troubleshooting

### Error: "relation does not exist"
```bash
# Pastikan pakai connection string yang benar
npx prisma db push
```

### Error: "SSL connection required"
Pastikan connection string ada `?sslmode=require`

### Error: "Invalid DATABASE_URL"
Copy ulang connection string dari Neon dashboard

### Error: "branch not found"
Check branch name di connection string dan pastikan branch sudah dibuat di Neon Dashboard

## 📚 Dokumentasi Lengkap

- **NEON_SETUP.md** - Panduan lengkap setup Neon
- **NEON_BRANCHES.md** - Strategy branch untuk deployment
- **MIGRATION_GUIDE.md** - Guide migrasi SQLite → PostgreSQL
- **DEPLOYMENT.md** - Info versi PostgreSQL per provider

## 💡 Tips

- **2 Branches Minimal:** Main (production) + Dev (development)
- **512 MB per branch:** Free tier cukup untuk 2-3 branches
- **Auto-suspend:** Database tidur setelah 5 menit idle
- **Database name sama:** Semua branches menggunakan `neondb`
- **Host berbeda:** Setiap branch punya host yang berbeda (ep-sweet-thunder vs ep-delicate-cake)
- **Reset dev branch:** Untuk testing tanpa risiko production

## 🎯 Next Steps

1. Setup admin user pertama
2. Configure payment amount
3. Test upload receipt
4. Setup domain custom (optional)

---

**Ready to deploy! 🚀**

Palau ada pertanyaan? Lihat dokumentasi di folder ini.

