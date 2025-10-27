# 🚀 Setup Neon Database (PostgreSQL 16)

## ✅ Status Configuration

- ✅ Schema Prisma sudah diupdate ke PostgreSQL
- ✅ Prisma Client sudah di-generate untuk PostgreSQL
- ⏳ Perlu setup Neon database account

## 📝 Langkah-langkah Setup Neon

### Step 1: Buat Account Neon (Gratis)

1. **Kunjungi https://neon.tech**
2. Klik **"Get started for free"** atau **"Sign up"**
3. Login dengan GitHub, Google, atau Email
4. Verifikasi email jika perlu

### Step 2: Buat Project Neon

1. Setelah login, klik **"Create Project"**
2. Fill in detail:
   - **Project name:** `payment-wifi` (atau nama lain)
   - **Region:** Pilih **Singapore** (tersedia) untuk latensi terbaik dari Indonesia
   - **PostgreSQL version:** 16 (otomatis latest)
3. Klik **"Create Project"**

### Step 3: Copy Connection String

Setelah project dibuat, akan muncul dashboard. 

1. Cari bagian **"Connection string"** atau **"Connection Details"**
2. Pilih tab **"Non-pooling connection"** (recommended untuk Prisma)
3. Copy connection string yang terlihat seperti ini:

```
postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

**⚠️ PENTING:** Copy PERSIS seperti itu termasuk parameter `?sslmode=require`

### Step 4: Setup Branch Strategy (Opsional)

#### A. Branch Main (Production) - Sudah Auto-created
1. Copy connection string dari **main** branch
2. Paste ke Vercel sebagai `DATABASE_URL` untuk **Production**

#### B. Buat Branch Dev (Development) - Manual
1. Di Neon Dashboard → **Branches** → **New Branch**
2. **Name:** `dev`
3. **Parent:** `main` (untuk sync dengan production)
4. **Create from:** pilih **"Create empty"** atau **"Copy data from main"**
5. Copy connection string dari **dev** branch
6. Paste ke Vercel sebagai `DATABASE_URL` untuk **Development**

#### C. Branch Preview (Opsional) - Manual
1. Di Neon Dashboard → **Branches** → **New Branch**
2. **Name:** `preview`
3. **Parent:** `main`
4. **Create from:** **"Create empty"**
5. Copy connection string dari **preview** branch
6. Paste ke Vercel sebagai `DATABASE_URL` untuk **Preview**

### Step 5: Update Environment Variables

#### A. Untuk Development (Local)

Buat file `.env` di root project (jika belum ada):

```env
# Neon Database - Main Branch (Production)
DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# Atau untuk Development Branch:
# DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dev?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Atau gunakan online generator: https://generate-secret.vercel.app/32

#### B. Untuk Production (Vercel)

1. Buka **Vercel Dashboard** → Pilih project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variables berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...main...` (Main branch) | Production |
| `DATABASE_URL` | `postgresql://...dev...` (Dev branch) | Development |
| `DATABASE_URL` | `postgresql://...preview...` (Preview branch) | Preview |
| `NEXTAUTH_SECRET` | Generated secret | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |

4. Klik **Save**

### Step 6: Push Schema ke Database

#### Untuk Local Development:

```bash
# Pastikan .env sudah setup dengan DATABASE_URL Neon
npx prisma db push

# Optional: Buka Prisma Studio untuk lihat data
npx prisma studio
```

#### Untuk Production (Vercel):

1. Vercel akan otomatis run `prisma generate` dan `prisma db push` saat deploy
2. Tapi bisa juga test manual:
   ```bash
   npx prisma db push
   ```

### Step 7: Test Connection

Test koneksi ke Neon database:

```bash
# Generate Prisma Client
npx prisma generate

# Check connection
npx prisma db pull

# Atau buka Prisma Studio
npx prisma studio
```

Jika berhasil, Anda akan melihat schema tables di Prisma Studio.

### Step 8: Deploy ke Vercel

1. **Commit dan push** perubahan ke GitHub:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL with Neon"
   git push origin main
   ```

2. Vercel akan auto-deploy atau trigger manual deploy

3. Pastikan Build Command di Vercel:
   ```
   npm run build
   ```

4. Setelah deploy selesai, test aplikasi:
   - Buka URL yang di-berikan Vercel
   - Test registrasi user
   - Test login

## 🔍 Verifikasi Setup

### Checklist:

- [ ] Neon project sudah dibuat
- [ ] Connection string sudah di-copy
- [ ] `.env` sudah setup untuk local development
- [ ] Environment variables sudah ditambahkan di Vercel
- [ ] `npx prisma generate` sudah di-run
- [ ] `npx prisma db push` sukses
- [ ] Schema tables terlihat di Prisma Studio
- [ ] Deploy ke Vercel sukses
- [ ] Aplikasi bisa diakses dan test registrasi/login

## 🌿 Branch Strategy di Neon

### Branch yang Diperlukan untuk Vercel Deployment:

| Branch Type | Environment | Purpose | Auto-Create |
|-------------|-------------|---------|-------------|
| **main** | Production | Database utama untuk production | ✅ Ya (otomatis) |
| **dev** | Development | Testing fitur baru, staging | ❌ Manual |
| **preview** | Preview | Preview deployments dari PR | ❌ Manual (opsional) |

### 1. Branch Main (Production)
- **Auto-created** saat buat project Neon
- **Connection string** untuk Vercel Production
- **Data real** users dan payments
- **Backup** otomatis setiap hari

### 2. Branch Dev (Development)
- **Manual create** untuk development environment
- **Connection string** untuk Vercel Development
- **Testing** fitur baru sebelum production
- **Reset** bisa dilakukan tanpa takut kehilangan data production

### 3. Branch Preview (Opsional)
- **Manual create** untuk preview deployments
- **Connection string** untuk Vercel Preview
- **Auto-sync** dari main branch
- **Testing** pull requests

## 💡 Tips Neon PostgreSQL 16

1. **Free Tier Include:**
   - 0.5 GB storage (cukup untuk banyak aplikasi)
   - **512 MB per branch** (bisa buat 2-3 branches)
   - Unlimited projects
   - Branching support
   - Auto-suspend after inactivity (free tier)

2. **Auto-suspend:**
   - Database akan auto-suspend setelah tidak digunakan
   - First query akan "wake up" database (sekitar 0.5-2 detik)
   - Free tier: database suspend setelah 5 menit idle

3. **Branching (Advanced):**
   - Bisa buat database branches untuk testing
   - Sync branches untuk development
   - **Reset branch** tanpa affect production

4. **Connection Modes:**
   - **Non-pooling** (recommended untuk Prisma): Stable connection
   - **Connection pooling**: Untuk high-traffic apps

## 🐛 Troubleshooting

### Error: "self signed certificate"

**Solution:** Pastikan connection string ada `?sslmode=require`

### Error: "database not found"

**Solution:** Copy connection string lagi, pastikan path database benar

### Error: "relation already exists"

**Solution:** Drop existing tables atau gunakan migrate

```bash
npx prisma migrate dev --name init
```

### Error: SSL connection required

**Solution:** Tambahkan `?sslmode=require` atau `?sslmode=prefer`

## 📊 Monitoring Neon

1. Buka **Neon Dashboard**
2. Lihat **Usage** untuk monitor storage
3. Lihat **Queries** untuk debug slow queries
4. Lihat **Branching** untuk manage branches

## 🎯 Next Steps

Setelah setup Neon sukses:

1. ✅ Test semua fitur aplikasi
2. ✅ Seed initial data (admin user)
3. ✅ Setup backup jika perlu
4. ✅ Monitor usage di Neon Dashboard
5. ✅ Scale up jika traffic meningkat

## 📞 Support

- **Neon Docs:** https://neon.tech/docs
- **Prisma + Neon:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon
- **Community:** https://discord.gg/neon

