import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Find or create current month's bill
    let bill = await db.bill.findFirst({
      where: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
      include: {
        payments: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    // If no bill exists, create one with default amount
    if (!bill) {
      // Get default bill amount from system settings or use default
      const defaultAmountSetting = await db.systemSettings.findUnique({
        where: { key: "default_bill_amount" }
      })

      const defaultAmount = defaultAmountSetting 
        ? parseInt(defaultAmountSetting.value) 
        : 67000

      bill = await db.bill.create({
        data: {
          userId: session.user.id,
          month: currentMonth,
          year: currentYear,
          amount: defaultAmount,
        },
        include: {
          payments: {
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      })
    }

    // Check if bill is fully paid
    const approvedPayments = bill.payments.filter(p => p.status === "APPROVED")
    const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0)
    const isPaid = totalPaid >= bill.amount

    // Update bill status
    if (bill.isPaid !== isPaid) {
      bill = await db.bill.update({
        where: { id: bill.id },
        data: { isPaid },
        include: {
          payments: {
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching current bill:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}