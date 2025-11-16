# 🗑️ Script Penghapusan User Member

Script ini digunakan untuk menghapus semua user dengan role `MEMBER` dari database, beserta data terkait (bills dan payments).

## ⚠️ PERINGATAN

**TINDAKAN INI TIDAK DAPAT DIKEMBALIKAN!**
- Semua user member akan dihapus permanen
- Semua tagihan (bills) terkait akan dihapus
- Semua pembayaran (payments) terkait akan dihapus
- Pastikan Anda benar-benar ingin menghapus data ini

## 🚀 Cara Menjalankan Script Setelah Deploy

### Metode 1: Via Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login ke Vercel**
```bash
vercel login
```

3. **Link ke project yang sudah di-deploy**
```bash
vercel link
```

4. **Download environment variables production**
```bash
vercel env pull .env.production
```

5. **Jalankan script dengan DATABASE_URL production**
```bash
# Windows (PowerShell)
$env:DATABASE_URL = (Get-Content .env.production | Where-Object { $_ -match "^DATABASE_URL=" }).Split("=",2)[1]
npx tsx scripts/delete-all-members.ts

# Windows (CMD)
for /f "tokens=2 delims==" %i in ('findstr DATABASE_URL .env.production') do set DATABASE_URL=%i
npx tsx scripts/delete-all-members.ts

# Linux/Mac
export $(cat .env.production | grep DATABASE_URL | xargs)
npx tsx scripts/delete-all-members.ts
```

### Metode 2: Langsung dengan DATABASE_URL

```bash
# Ganti dengan DATABASE_URL production Anda
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require" npx tsx scripts/delete-all-members.ts
```

### Metode 3: Via GitHub Actions (CI/CD)

1. **Buat file `.github/workflows/cleanup-members.yml`**
```yaml
name: Cleanup Members
on:
  workflow_dispatch: # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run cleanup script
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx tsx scripts/delete-all-members.ts
```

2. **Tambahkan `DATABASE_URL` ke GitHub Secrets**
   - Buka repository → Settings → Secrets and variables → Actions
   - Klik "New repository secret"
   - Name: `DATABASE_URL`
   - Value: `postgresql://...` (URL database production)

3. **Jalankan workflow**
   - Buka tab "Actions" di GitHub
   - Pilih workflow "Cleanup Members"
   - Klik "Run workflow"

## 📋 Apa yang Dilakukan Script

1. **Mencari semua user dengan role `MEMBER`**
2. **Menampilkan detail user yang akan dihapus**
3. **Menghapus semua user member** (dengan cascade delete untuk bills dan payments)
4. **Menampilkan konfirmasi hasil penghapusan**
5. **Menampilkan user yang tersisa di database**

## 🔍 Output Script

```
🗑️  Menghapus semua user member dari database...

📋 Ditemukan 3 user member:
   1. user1@example.com (John Doe)
      Dibuat: 25/10/2025, 10.30.15
   2. user2@example.com (Jane Smith)
      Dibuat: 26/10/2025, 14.20.30
   3. user3@example.com (Bob Wilson)
      Dibuat: 27/10/2025, 09.15.45

⚠️  PERINGATAN: Tindakan ini akan menghapus:
   - Semua data user member
   - Semua tagihan (bills) terkait
   - Semua pembayaran (payments) terkait
   - Data ini TIDAK DAPAT DIKEMBALIKAN!

🔄 Memulai penghapusan...
✅ Berhasil menghapus 3 user member

📊 User yang tersisa:
   1. admin@example.com (Admin) - ADMIN
```

## 🛠️ Troubleshooting

### Error: "PrismaClientInitializationError"
- Pastikan `DATABASE_URL` benar dan dapat diakses
- Pastikan Prisma client sudah di-generate: `npx prisma generate`

### Error: "Connection timeout"
- Periksa koneksi internet
- Pastikan database server aktif
- Periksa firewall/security group

### Error: "Permission denied"
- Pastikan user database memiliki permission untuk DELETE
- Periksa apakah ada foreign key constraints yang menghalangi

## 📝 Catatan Penting

- Script ini hanya menghapus user dengan role `MEMBER`
- User dengan role `ADMIN` tidak akan terpengaruh
- Semua penghapusan menggunakan cascade delete (otomatis menghapus data terkait)
- Script akan menampilkan konfirmasi sebelum menghapus
- Setelah penghapusan, script akan menampilkan user yang tersisa

## 🔒 Keamanan

- Jangan commit file `.env.production` ke repository
- Gunakan environment variables untuk menyimpan DATABASE_URL
- Pastikan hanya orang yang berwenang yang menjalankan script ini
- Backup database sebelum menjalankan script (opsional tapi recommended)

## 📞 Support

Jika mengalami masalah, periksa:
1. Koneksi database
2. Permission user database
3. Format DATABASE_URL
4. Status aplikasi yang di-deploy

---

**⚠️ INGAT: Tindakan penghapusan bersifat PERMANEN dan TIDAK DAPAT DIKEMBALIKAN!**
