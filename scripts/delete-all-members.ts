import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️  Menghapus semua user member dari database...\n")
  
  // Cari semua user dengan role MEMBER
  const members = await prisma.user.findMany({
    where: {
      role: "MEMBER"
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })
  
  if (members.length === 0) {
    console.log("✅ Tidak ada user member yang ditemukan")
    
    // Tampilkan semua user yang ada
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log("\n📊 User yang tersisa di database:")
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name || 'No name'}) - ${user.role}`)
    })
    
    return
  }
  
  console.log(`📋 Ditemukan ${members.length} user member:`)
  members.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.email} (${member.name || 'No name'})`)
    console.log(`      Dibuat: ${member.createdAt.toLocaleString('id-ID')}`)
  })
  
  console.log("\n⚠️  PERINGATAN: Tindakan ini akan menghapus:")
  console.log("   - Semua data user member")
  console.log("   - Semua tagihan (bills) terkait")
  console.log("   - Semua pembayaran (payments) terkait")
  console.log("   - Data ini TIDAK DAPAT DIKEMBALIKAN!")
  
  // Konfirmasi penghapusan
  console.log("\n🔄 Memulai penghapusan...")
  
  try {
    // Hapus semua user member (cascade akan menghapus bills dan payments terkait)
    const deleteResult = await prisma.user.deleteMany({
      where: {
        role: "MEMBER"
      }
    })
    
    console.log(`✅ Berhasil menghapus ${deleteResult.count} user member`)
    
    // Verifikasi hasil
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log("\n📊 User yang tersisa:")
    if (remainingUsers.length === 0) {
      console.log("   Tidak ada user tersisa")
    } else {
      remainingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name || 'No name'}) - ${user.role}`)
      })
    }
    
  } catch (error) {
    console.error("❌ Error saat menghapus user member:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
