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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const status = searchParams.get("status") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const whereClause: any = {}
    if (status !== "all") {
      whereClause.status = status
    }
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Fetch payments with related data
    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        bill: {
          select: {
            month: true,
            year: true,
            amount: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID Pembayaran",
        "Nama User",
        "Email User",
        "Bulan",
        "Tahun",
        "Jenis Pembayaran",
        "Jumlah",
        "Status",
        "Tanggal Pembayaran",
        "Catatan",
        "URL Bukti"
      ]

      const rows = payments.map(payment => [
        payment.id,
        payment.user.name || "",
        payment.user.email,
        payment.bill.month.toString(),
        payment.bill.year.toString(),
        payment.type,
        payment.amount.toString(),
        payment.status,
        payment.createdAt.toISOString(),
        payment.notes || "",
        payment.receiptUrl || ""
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payment-history-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Return JSON
      return NextResponse.json(payments)
    }
  } catch (error) {
    console.error("Error exporting payment history:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}