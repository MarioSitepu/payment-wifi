import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const settings = await db.systemSettings.findMany({
      orderBy: {
        key: "asc"
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { key, value, description } = await request.json()

    if (!key || !value) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Check if setting exists, update if it does, create if it doesn't
    const existingSetting = await db.systemSettings.findUnique({
      where: { key }
    })

    let setting
    if (existingSetting) {
      setting = await db.systemSettings.update({
        where: { key },
        data: {
          value,
          description: description || existingSetting.description
        }
      })
    } else {
      setting = await db.systemSettings.create({
        data: {
          key,
          value,
          description: description || ""
        }
      })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}