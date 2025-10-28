# 🚀 Panduan Deploy dengan PostgreSQL

## 📌 Masalah yang Terjadi
Saat ini login admin gagal karena:
- Database menggunakan PostgreSQL di production
- Belum ada environment variables di Vercel
- Belum ada user admin di database PostgreSQL

## ✅ Solusi - Setup untuk Deploy

### Langkah 1: Setup Database PostgreSQL

**Option A: Gunakan Neon (Recommended - Gratis)**
1. Kunjungi https://neon.tech
2. Buat account baru (gratis)
3. Create new project
4. Copy **connection string** (format: `postgresql://...`)

**Option B: Gunakan Supabase (Gratis)**
1. Kunjungi https://supabase.com
2. Create new project
3. Copy connection string dari Settings → Database

**Option C: Gunakan Vercel Postgres (Direct Integration)**
1. Di Vercel Dashboard → Project Settings
2. Add Integration → Vercel Postgres
3. Otomatis dapat DATABASE_URL

### Langkah 2: Setup Environment Variables di Vercel

1. Buka Vercel Dashboard → Project Anda
2. Settings → Environment Variables
3. Tambahkan 3 environment variables:

```
DATABASE_URL=postgresql://username:password@host:5432/database
```

```
NEXTAUTH_URL=https://your-app.vercel.app
```

```
NEXTAUTH_SECRET=your-generated-secret-here
```

**Generate NEXTAUTH_SECRET:**
```bash
# Di terminal, jalankan:
openssl rand -base64 32
```
Copy hasilnya dan paste sebagai `NEXTAUTH_SECRET`

### Langkah 3: Setup Database Schema di PostgreSQL

Setelah setup database dan environment variables:

**Di Vercel, setup build command:**
Tambahkan di `vercel.json` atau buat file baru:

```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm install"
}
```

### Langkah 4: Create Admin User di Database PostgreSQL

**Cara 1: Via Prisma Studio**
```bash
# Set DATABASE_URL ke PostgreSQL
DATABASE_URL="postgresql://..." npx prisma studio
```
Lalu create user manually via UI

**Cara 2: Via Script**
```bash
# Jalankan script untuk create admin
DATABASE_URL="postgresql://..." npx tsx scripts/create-admin-postgres.ts
```

**Cara 3: Via SQL Query (di database console)**
```sql
-- Run di SQL editor (Neon/Supabase dashboard)
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'admin@example.com',
  'Admin',
  '$2a$10$...hashed_password',  -- Generate dengan bcrypt
  'ADMIN',
  NOW(),
  NOW()
);
```

### Langkah 5: Deploy

1. Commit dan push ke GitHub
2. Vercel akan auto-deploy
3. Tunggu deploy selesai

### Langkah 6: Test Login Admin

Setelah deploy selesai:
1. Buka https://your-app.vercel.app/auth/signin
2. Login dengan:
   - Email: `admin@example.com`
   - Password: `admin123`

## 🔑 Default Admin Credentials

**Email:** admin@example.com  
**Password:** admin123

⚠️ **PENTING:** Ganti password setelah first login untuk security!

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
- Pastikan DATABASE_URL sudah benar di Vercel
- Pastikan database allow connections dari Vercel IP

### Error: "NEXTAUTH_SECRET not found"
- Tambahkan NEXTAUTH_SECRET di Vercel
- Redeploy setelah tambah env variable

### Error: "No admin user found"
- Jalankan script `create-admin-postgres.ts`
- Atau create manually via Prisma Studio

### Error 401 Unauthorized
- Pastikan password sudah di-hash dengan bcrypt
- Pastikan user ada di database
- Check console untuk error details

## 📝 Checklist Deploy

- [ ] Setup PostgreSQL database (Neon/Supabase)
- [ ] Add DATABASE_URL ke Vercel
- [ ] Add NEXTAUTH_URL ke Vercel
- [ ] Add NEXTAUTH_SECRET ke Vercel
- [ ] Push schema.prisma dengan provider "postgresql"
- [ ] Run prisma generate & prisma db push di database
- [ ] Create admin user di database
- [ ] Test login di deployed URL
- [ ] Change default password untuk security

## 🎉 Done!

Setelah semua langkah selesai, Anda bisa login sebagai admin di production!


