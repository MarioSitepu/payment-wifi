import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { PaymentStatus } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { action, notes } = await request.json()

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Action tidak valid" },
        { status: 400 }
      )
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        bill: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Pembayaran tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: action === "approve" ? PaymentStatus.APPROVED : PaymentStatus.REJECTED,
        notes: notes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        bill: {
          select: {
            id: true,
            month: true,
            year: true,
            amount: true,
          }
        }
      }
    })

    // Update bill status if payment was approved
    if (action === "approve") {
      // Calculate total approved payments for this bill
      const approvedPayments = await db.payment.findMany({
        where: {
          billId: payment.billId,
          status: PaymentStatus.APPROVED,
        }
      })

      const totalApproved = approvedPayments.reduce((sum, p) => sum + p.amount, 0)
      const isBillPaid = totalApproved >= payment.bill.amount

      // Update bill status
      await db.bill.update({
        where: { id: payment.billId },
        data: { isPaid: isBillPaid }
      })
    }

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}