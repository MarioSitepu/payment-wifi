import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🔐 Creating admin user in PostgreSQL database...\n")
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" }
  })
  
  if (existingAdmin) {
    console.log("✅ Admin user already exists")
    console.log(`   Email: ${existingAdmin.email}`)
    console.log(`   Role: ${existingAdmin.role}`)
    
    // Update password in case we need to
    const newPassword = await hash("admin123", 10)
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { password: newPassword }
    })
    console.log("\n   Password updated to: admin123")
    return
  }
  
  // Create new admin user
  const password = await hash("admin123", 10)
  
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: password,
      role: "ADMIN"
    }
  })
  
  console.log("✅ Admin user created successfully!")
  console.log("\n📋 Login Credentials:")
  console.log(`   Email: ${admin.email}`)
  console.log(`   Password: admin123`)
  console.log(`   Role: ${admin.role}`)
  console.log(`   ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


