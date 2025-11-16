import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { PaymentType, PaymentStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { billId, amount, type, receiptUrl, notes } = await request.json()

    // Validate input
    if (!billId || !amount || !type || !receiptUrl) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    // Check if bill exists and belongs to user
    const bill = await db.bill.findFirst({
      where: {
        id: billId,
        userId: session.user.id,
      },
      include: {
        payments: true,
      }
    })

    if (!bill) {
      return NextResponse.json(
        { message: "Tagihan tidak ditemukan" },
        { status: 404 }
      )
    }

    // Calculate remaining amount
    const approvedPayments = bill.payments.filter(p => p.status === "APPROVED")
    const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0)
    const remainingAmount = bill.amount - totalPaid

    // Validate payment amount
    if (amount > remainingAmount) {
      return NextResponse.json(
        { message: `Jumlah pembayaran melebihi sisa tagihan (${remainingAmount})` },
        { status: 400 }
      )
    }

    // Check installment limits
    if (type === PaymentType.INSTALLMENT_1 || type === PaymentType.INSTALLMENT_2) {
      const existingInstallments = bill.payments.filter(p => 
        p.type === PaymentType.INSTALLMENT_1 || p.type === PaymentType.INSTALLMENT_2
      )
      
      if (existingInstallments.length >= 2) {
        return NextResponse.json(
          { message: "Maksimal 2 kali cicilan per bulan" },
          { status: 400 }
        )
      }

      // Check if this installment type already exists
      if (existingInstallments.some(p => p.type === type)) {
        return NextResponse.json(
          { message: `Cicilan ${type === PaymentType.INSTALLMENT_1 ? "1" : "2"} sudah ada` },
          { status: 400 }
        )
      }
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        billId,
        userId: session.user.id,
        amount,
        type: type as PaymentType,
        status: PaymentStatus.PENDING,
        receiptUrl,
        notes: notes || null,
      },
      include: {
        bill: true,
        user: true,
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const billId = searchParams.get("billId")

    if (billId) {
      // Get payments for specific bill
      const payments = await db.payment.findMany({
        where: {
          billId,
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc"
        }
      })

      return NextResponse.json(payments)
    } else {
      // Get all payments for user
      const payments = await db.payment.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          bill: true,
        },
        orderBy: {
          createdAt: "desc"
        }
      })

      return NextResponse.json(payments)
    }
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}