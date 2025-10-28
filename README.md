# WiFi Payment Manager

![WiFi Payment Manager](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-cyan) ![Prisma](https://img.shields.io/badge/Prisma-6.17-informational)

Sistem pembayaran WiFi bulanan yang modern dan mudah digunakan dengan fitur cicilan dan verifikasi admin. Dibangun dengan Next.js 15, TypeScript, dan Prisma.

## 🌟 Fitur Utama

### 👤 Untuk Member
- **Registrasi & Login** - Sistem autentikasi yang aman
- **Dashboard Personal** - Lihat tagihan bulanan dan status pembayaran
- **Pembayaran Fleksibel** - Bayar penuh atau cicil 2 kali dalam sebulan
- **Upload Bukti Pembayaran** - Upload screenshot bukti transfer dengan mudah
- **Tracking Status** - Pantau status verifikasi pembayaran (Menunggu/Disetujui/Ditolak)
- **Riwayat Pembayaran** - Lihat semua riwayat transaksi pribadi
- **Validasi Otomatis** - Sistem mencegah pembayaran melebihi jumlah tagihan

### 👨‍💼 Untuk Admin
- **Dashboard Admin** - Kontrol penuh atas sistem pembayaran
- **Verifikasi Pembayaran** - Review dan approve/tolak pembayaran member
- **Preview Bukti Pembayaran** - Lihat screenshot bukti transfer yang diupload
- **Manajemen User** - Edit data user dan ubah role (Member/Admin)
- **Pengaturan Sistem** - Atur default jumlah tagihan bulanan
- **Export Data** - Download riwayat pembayaran dalam format CSV
- **Statistik Real-time** - Monitor jumlah user dan transaksi

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd wifi-payment-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit file `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Setup database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create admin user (optional)
npx tsx src/lib/seed.ts
```

5. **Run development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

## 📱 Demo Credentials

### Admin Account
- **Email:** `admin@wifipayment.com`
- **Password:** `password123`

### Member Account
- **Registrasi:** Melalui halaman registrasi
- **Password:** `password123` (untuk semua akun demo)

## 🏗️ Teknologi yang Digunakan

### Frontend
- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type safety dan better developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **NextAuth.js** - Authentication library untuk Next.js
- **React Hook Form** - Form handling dengan performance optimal
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Backend API built-in
- **Prisma** - Modern database toolkit
- **SQLite** - Database serverless (mudah untuk development)
- **bcryptjs** - Password hashing

### Tools & Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **tsx** - TypeScript execution

## 📁 Struktur Proyek

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bills/         # Bill management
│   │   ├── payments/      # Payment processing
│   │   ├── upload/        # File upload
│   │   └── admin/         # Admin endpoints
│   ├── auth/              # Authentication pages
│   ├── member/            # Member dashboard & pages
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database connection
│   ├── utils.ts         # Helper functions
│   └── seed.ts          # Database seed script
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

## 🗄️ Database Schema

### Users
```sql
- id: String (Primary Key)
- email: String (Unique)
- name: String (Optional)
- role: Enum (ADMIN, MEMBER)
- createdAt: DateTime
- updatedAt: DateTime
```

### Bills
```sql
- id: String (Primary Key)
- userId: String (Foreign Key)
- month: Integer (1-12)
- year: Integer
- amount: Integer (Default: 67000)
- isPaid: Boolean (Default: false)
- createdAt: DateTime
- updatedAt: DateTime
```

### Payments
```sql
- id: String (Primary Key)
- billId: String (Foreign Key)
- userId: String (Foreign Key)
- amount: Integer
- type: Enum (FULL, INSTALLMENT_1, INSTALLMENT_2)
- status: Enum (PENDING, APPROVED, REJECTED)
- receiptUrl: String (Optional)
- notes: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### System Settings
```sql
- id: String (Primary Key)
- key: String (Unique)
- value: String
- description: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string | - | ✅ |
| `NEXTAUTH_SECRET` | JWT secret key | - | ✅ |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` | ✅ |

### Customization

#### Mengubah Default Tagihan
1. Login sebagai admin
2. Go to Dashboard → Pengaturan
3. Ubah "Jumlah Tagihan Bulanan"
4. Klik "Simpan Pengaturan"

#### Menambah Admin Baru
1. Login sebagai admin
2. Go to Dashboard → Manajemen User
3. Cari user yang ingin dijadikan admin
4. Ubah role dari "MEMBER" menjadi "ADMIN"
5. Klik "Update"

#### Custom Styling
Edit file `tailwind.config.ts` untuk mengubah tema:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          // ... tambahkan warna custom
        }
      }
    }
  }
}
```

## 📊 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Registrasi user baru
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/[...nextauth]`
Handle login dan session management

### Member Endpoints

#### GET `/api/bills/current`
Mendapatkan tagihan bulan ini
```json
{
  "id": "bill_123",
  "month": 12,
  "year": 2024,
  "amount": 67000,
  "isPaid": false,
  "payments": []
}
```

#### POST `/api/payments`
Membuat pembayaran baru
```json
{
  "billId": "bill_123",
  "amount": 33500,
  "type": "INSTALLMENT_1",
  "receiptUrl": "/receipts/image.jpg",
  "notes": "Cicilan pertama"
}
```

#### GET `/api/payments`
Mendapatkan riwayat pembayaran user

### Admin Endpoints

#### GET `/api/admin/payments`
Mendapatkan semua pembayaran (admin only)

#### PATCH `/api/admin/payments`
Verifikasi pembayaran
```json
{
  "paymentId": "payment_123",
  "status": "APPROVED",
  "notes": "Bukti pembayaran valid"
}
```

#### GET `/api/admin/users`
Mendapatkan semua user (admin only)

#### PATCH `/api/admin/users`
Update data user
```json
{
  "userId": "user_123",
  "name": "John Updated",
  "role": "ADMIN"
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push ke GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy ke Vercel**
   - Connect repository ke Vercel
   - Add environment variables
   - Deploy automatically

### Manual Deployment

1. **Build aplikasi**
```bash
npm run build
```

2. **Setup production environment**
```bash
# .env.production
DATABASE_URL="file:./production.db"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

3. **Start production server**
```bash
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

### Password Security
- Demo menggunakan password sederhana untuk kemudahan
- Production: Implementasi password hashing yang proper
- Gunakan password complexity requirements
- Implementasi rate limiting untuk login attempts

### File Upload Security
- Validasi file type dan size
- Sanitize filename
- Consider using cloud storage instead of local storage
- Implement virus scanning untuk production

### API Security
- Role-based access control (RBAC)
- Input validation dan sanitization
- Rate limiting untuk API endpoints
- HTTPS untuk production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible UI components
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js

## 📞 Support

Jika Anda memiliki pertanyaan atau menemukan bug, silakan:

1. Cek [Issues](https://github.com/your-repo/issues) page
2. Buat new issue jika belum ada
3. Email: support@your-domain.com

## 🎯 Roadmap

### Phase 1 (Completed)
- [x] Basic authentication system
- [x] Member registration and dashboard
- [x] Payment processing with installments
- [x] Admin verification system
- [x] File upload for receipts
- [x] Export functionality

### Phase 2 (Future)
- [ ] Email notifications for payment status
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Dark mode theme

### Phase 3 (Long-term)
- [ ] Subscription management
- [ ] Multiple WiFi plans
- [ ] Automated billing system
- [ ] Integration with ISP management systems
- [ ] Mobile wallet integration

---

**Built with ❤️ using Next.js and TypeScript**

[![Website](https://img.shields.io/badge/Website-Visit-green)](http://localhost:3000)
[![Documentation](https://img.shields.io/badge/Documentation-Read-blue)](README.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
