import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Create new user (for demo, we're not hashing passwords)
    const user = await db.user.create({
      data: {
        name,
        email,
        role: Role.MEMBER
      }
    })

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}