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

    // Get basic stats
    const [
      totalUsers,
      totalBills,
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments
    ] = await Promise.all([
      db.user.count({
        where: { role: "MEMBER" }
      }),
      db.bill.count(),
      db.payment.count(),
      db.payment.count({
        where: { status: "PENDING" }
      }),
      db.payment.count({
        where: { status: "APPROVED" }
      }),
      db.payment.count({
        where: { status: "REJECTED" }
      })
    ])

    // Get total revenue from approved payments
    const revenueResult = await db.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: {
        amount: true
      }
    })

    const totalRevenue = revenueResult._sum.amount || 0

    const stats = {
      totalUsers,
      totalBills,
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}