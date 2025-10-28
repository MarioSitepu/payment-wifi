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
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    if (!monthParam || !yearParam) {
      return NextResponse.json({ message: "Parameter month dan year wajib diisi" }, { status: 400 })
    }

    const month = parseInt(monthParam, 10)
    const year = parseInt(yearParam, 10)

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000) {
      return NextResponse.json({ message: "Parameter month/year tidak valid" }, { status: 400 })
    }

    // Ambil semua member beserta bill bulan/tahun tersebut dan payments-nya
    const members = await db.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        name: true,
        email: true,
        bills: {
          where: { month, year },
          include: {
            payments: true,
          }
        }
      },
      orderBy: { email: "asc" }
    })

    const memberStatuses = members.map((member) => {
      const bill = member.bills[0]
      if (!bill) {
        return {
          userId: member.id,
          name: member.name || member.email,
          email: member.email,
          month,
          year,
          amount: null as number | null,
          paidApproved: 0,
          remaining: null as number | null,
          isPaid: false,
          status: "NO_BILL" as const,
        }
      }

      const approvedPayments = bill.payments.filter(p => p.status === "APPROVED")
      const paidApproved = approvedPayments.reduce((sum, p) => sum + p.amount, 0)
      const remaining = Math.max(bill.amount - paidApproved, 0)

      return {
        userId: member.id,
        name: member.name || member.email,
        email: member.email,
        month: bill.month,
        year: bill.year,
        amount: bill.amount,
        paidApproved,
        remaining,
        isPaid: remaining <= 0,
        status: remaining <= 0 ? "PAID" as const : "UNPAID" as const,
      }
    })

    const paid = memberStatuses.filter(item => item.status === "PAID")
    const unpaid = memberStatuses.filter(item => item.status === "UNPAID" || item.status === "NO_BILL")

    return NextResponse.json({
      month,
      year,
      totalMembers: members.length,
      totalPaid: paid.length,
      totalUnpaid: unpaid.length,
      paid,
      unpaid,
      data: memberStatuses, // All statuses for convenience
    })
  } catch (error) {
    console.error("Error fetching unpaid members:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}


