# 🌿 Neon Branch Strategy untuk Vercel Deployment

## 📊 Branch yang Diperlukan di Neon

Di Neon, **branch** adalah database terpisah dengan data sendiri. Berikut struktur yang diperlukan:

### 1. **Branch Main** (Production) ⭐ **WAJIB**
- **Auto-created** saat buat project Neon
- **Purpose:** Database production dengan data real users
- **Connection:** Vercel Production environment
- **Database name:** `neondb` (default)
- **Features:**
  - ✅ Backup otomatis (daily)
  - ✅ Point-in-time recovery
  - ✅ Data users dan payments real
  - ✅ High availability

### 2. **Branch Dev** (Development) ⭐ **WAJIB**
- **Manual create** di Neon Dashboard
- **Purpose:** Testing dan development tanpa risiko production
- **Connection:** Vercel Development environment
- **Database name:** `dev` (custom)
- **Features:**
  - ✅ Testing fitur baru tanpa risiko
  - ✅ Reset database kapan saja
  - ✅ Copy data dari production (opsional)
  - ✅ Sync dengan main branch

### 3. **Branch Preview** (Opsional)
- **Manual create** untuk preview deployments
- **Purpose:** Testing pull requests
- **Connection:** Vercel Preview environment
- **Database name:** `preview` (custom)
- **Features:**
  - ✅ Auto-sync dari main branch
  - ✅ Testing PR tanpa affect dev/production
  - ✅ Fresh data untuk setiap PR

## 📋 Visualisasi Branch di Neon

```
🌿 NEON DATABASE BRANCHES
├── 🔴 main (Production)
│   ├── Database: neondb ← Default untuk semua branches
│   ├── Data: Users & Payments Real
│   ├── Vercel: Production Environment
│   └── Backup: Daily Automatic
│
├── 🟡 dev (Development) ← Buat Manual!
│   ├── Database: neondb ← Default untuk semua branches
│   ├── Data: Testing & Development
│   ├── Vercel: Development Environment
│   └── Reset: Kapan Saja
│
└── 🟢 preview (Optional)
    ├── Database: neondb ← Default untuk semua branches
    ├── Data: PR Testing
    ├── Vercel: Preview Environment
    └── Sync: Auto dari main
```

## 🚀 Quick Setup Branch

### Step 1: Buat Branch Dev

1. **Login ke Neon Dashboard** → https://console.neon.tech
2. Pilih project Anda
3. Klik **"Branches"** di sidebar
4. Klik **"New Branch"**
5. **Fill details:**
   - **Name:** `dev`
   - **Parent branch:** `main`
   - **Create from:** **"Create empty"** (recommended)
6. Klik **"Create Branch"**

### Step 2: Copy Connection Strings

Setelah branch dibuat:

#### 🔴 Main Branch (Production):
```
postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 🟡 Dev Branch (Development):
```
postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**✅ Database name `neondb` SAMA untuk semua branches (ini yang BENAR!)**

### Step 3: Setup di Vercel

#### Environment Variables di Vercel:

| Variable | Production Environment | Development Environment | Preview Environment |
|----------|----------------------|------------------------|-------------------|
| `DATABASE_URL` | `postgresql://...neondb...` | `postgresql://...neondb...` | `postgresql://...neondb...` |
| `NEXTAUTH_SECRET` | `aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=` | `aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=` | `aRMNAZjHbxyc3zZjReRRrZMLoyPCehmYgXW050QSqw8=` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | `https://your-app-dev.vercel.app` | `https://your-app-preview.vercel.app` |

**Cara Setup:**
1. Vercel Dashboard → Settings → Environment Variables
2. Pilih **Environment** (Production/Development/Preview)
3. Paste connection string yang sesuai

### Step 4: Push Schema ke Semua Branches

```bash
# Main branch (Production)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push

# Dev branch (Development)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push

# Preview branch (Opsional)
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push
```

## 🔄 Workflow Development Praktis

### 💻 Development Sehari-hari:

```bash
# 1. Development di local dengan dev branch
git checkout develop
# Edit .env dengan DATABASE_URL dev branch
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run dev

# 2. Push dan deploy ke Vercel Development
git add .
git commit -m "Add new feature"
git push origin develop
# Auto-deploy ke: https://your-app-dev.vercel.app (database: dev branch)
```

### 🚀 Production Deployment:

```bash
# 3. Test di development selesai
# 4. Merge ke main branch
git checkout main
git merge develop
git push origin main
# Auto-deploy ke: https://your-app.vercel.app (database: main branch)
```

### 👀 Preview untuk Pull Requests:

```bash
# 5. Create PR di GitHub
# 6. Auto-deploy preview: https://your-app-preview.vercel.app (database: preview branch)
# 7. Test di preview environment
# 8. Merge PR setelah approved
```

**Data Flow:**
- **Development:** dev branch (data testing) - database: neondb
- **Preview:** preview branch (data PR testing) - database: neondb
- **Production:** main branch (data real users) - database: neondb

**⚠️ Database name `neondb` SAMA untuk semua branches, yang berbeda adalah HOST dan BRANCH!**

## 💰 Biaya Branches

**Free Tier Neon:**
- **512 MB per branch**
- **0.5 GB total** = bisa buat **2-3 branches**
- **Main + Dev** = 1 GB total (masih free)
- **Main + Dev + Preview** = 1.5 GB (masih free)

**Storage per branch:**
- Main: 512 MB (production data) - database: neondb
- Dev: 512 MB (testing data) - database: neondb
- Preview: 512 MB (PR testing data) - database: neondb

**Database name `neondb` SAMA untuk semua branches!**

## 🛠️ Management Commands

### Check Current Branch
```bash
# Lihat semua branches
npx prisma db pull

# Switch branch di local development
# Edit .env file dengan DATABASE_URL yang sesuai
```

### Reset Branch Dev
```bash
# Reset dev branch ke empty state
# 1. Login Neon Dashboard
# 2. Branches → Dev → Reset
# 3. Push schema lagi
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push
```

### Copy Data dari Production
```bash
# 1. Di Neon Dashboard: Branches → Dev → Reset
# 2. Pilih "Copy data from main"
# 3. Push schema lagi
DATABASE_URL="postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push
```

## 📊 Monitoring Branches

### Neon Dashboard:
- **Storage usage** per branch
- **Query performance** per branch
- **Connection count** per branch
- **Auto-suspend** status

### Vercel Dashboard:
- **Deploy status** per environment
- **Environment variables** per environment
- **Function logs** per environment

## 🎯 Best Practices

### 1. **Always Test di Dev First**
```bash
# Develop di dev branch
git checkout develop
# Edit code, test di localhost dengan dev branch database (neondb)
# Deploy ke Vercel Development untuk testing
```

### 2. **Don't Touch Production Data**
- Jangan edit data production langsung
- Gunakan dev branch untuk testing
- Reset dev branch jika perlu fresh start

### 3. **Use Preview untuk PR Testing**
- Setiap PR auto-deploy ke preview
- Test integration sebelum merge
- Auto-cleanup setelah PR closed

### 4. **Regular Sync**
- Sync dev branch dengan main regularly
- Update preview branch dari main
- Keep branches in sync untuk avoid conflicts

## 🚨 Troubleshooting

### Error: "branch not found"
**Solution:** Check connection string dan pastikan branch sudah dibuat di Neon Dashboard

### Error: "insufficient storage"
**Solution:** Reset branch atau upgrade plan

### Error: "connection timeout"
**Solution:** Branch mungkin auto-suspended, wait 1-2 seconds untuk wake up

## 📚 Reference

- **Neon Branching Docs:** https://neon.tech/docs/guides/branching
- **Prisma with Neon:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

**Summary:** Minimal **2 branches** (main + dev) untuk deployment yang solid! 🚀

