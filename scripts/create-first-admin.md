# 🚀 Cara Create Admin User Setelah Deploy

## Metode 1: Via Prisma Studio (Termudah)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link ke project Vercel:
```bash
vercel link
```

3. Run Prisma Studio:
```bash
vercel env pull  # Download environment variables
DATABASE_URL="your-postgresql-url" npx prisma studio
```

4. Di Prisma Studio (localhost:5555):
   - Pilih User table
   - Klik "Add record"
   - Isi form:
     - email: admin@example.com
     - name: Admin
     - password: (paste hashed password dari bcrypt)
     - role: ADMIN
   - Save

## Metode 2: Via Script (Lebih Mudah)

1. Setup DATABASE_URL:
```bash
# Copy connection string dari Neon/Supabase
export DATABASE_URL="postgresql://..."
```

2. Jalankan script:
```bash
npx tsx scripts/create-admin-postgres.ts
```

## Metode 3: Via Neon/Supabase SQL Editor

1. Buka Neon/Supabase dashboard
2. Buka SQL Editor
3. Run query:

```sql
-- Generate password hash (ganti 'admin123' dengan password Anda)
-- Gunakan bcrypt online: https://bcrypt-generator.com/
-- Atau run: node -e "console.log(require('bcryptjs').hashSync('admin123', 10).then(h => console.log(h)))"

INSERT INTO users (
  id, 
  email, 
  name, 
  password, 
  role, 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  'Admin',
  '$2a$10$hashed_password_here',  -- Bcrypt hash dari "admin123"
  'ADMIN',
  NOW(),
  NOW()
);
```

## Metode 4: Via Vercel CLI (Production)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull env variables
vercel env pull .env.local

# Use production DATABASE_URL
DATABASE_URL="your-production-db-url" npx tsx scripts/create-admin-postgres.ts
```

## Hasil yang Diperoleh

Admin user dengan kredensial:
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** ADMIN

Setelah ini, Anda bisa login di https://your-app.vercel.app/auth/signin


