import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload receipt request started")
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log("No session found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Session found for user:", session.user?.email)

    const data = await request.formData()
    const file: File | null = data.get("receipt") as unknown as File

    if (!file) {
      console.log("No file uploaded")
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type)

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "File type not allowed. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (3MB max to account for base64 encoding)
    const maxSize = 3 * 1024 * 1024 // 3MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size too large. Maximum size is 3MB." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}-${randomId}.${fileExtension}`

    // Convert file to base64 for storage (simple solution for Vercel)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`
    
    console.log("File converted to base64, size:", base64Data.length)

    return NextResponse.json({ 
      receiptUrl: dataUrl,
      fileName: fileName 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat upload file" },
      { status: 500 }
    )
  }
}