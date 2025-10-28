"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Bill {
  id: string
  month: number
  year: number
  amount: number
  isPaid: boolean
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  type: "FULL" | "INSTALLMENT_1" | "INSTALLMENT_2"
  status: "PENDING" | "APPROVED" | "REJECTED"
  receiptUrl?: string
  createdAt: string
}

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentBill, setCurrentBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role === "ADMIN") {
      router.push("/admin")
      return
    }

    fetchCurrentBill()
  }, [session, status, router])

  const fetchCurrentBill = async () => {
    try {
      const response = await fetch("/api/bills/current")
      if (response.ok) {
        const bill = await response.json()
        setCurrentBill(bill)
      } else {
        toast.error("Gagal memuat data tagihan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    return months[month - 1]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Disetujui</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="secondary">Menunggu</Badge>
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "FULL":
        return "Pembayaran Penuh"
      case "INSTALLMENT_1":
        return "Cicilan 1"
      case "INSTALLMENT_2":
        return "Cicilan 2"
      default:
        return type
    }
  }

  const calculatePaidAmount = () => {
    if (!currentBill) return 0
    return currentBill.payments
      .filter(p => p.status === "APPROVED")
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const calculateRemainingAmount = () => {
    if (!currentBill) return 0
    return currentBill.amount - calculatePaidAmount()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Member</h1>
          <p className="text-muted-foreground">
            Selamat datang, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={async () => {
            await signOut({ callbackUrl: "/" })
          }}
        >
          Logout
        </Button>
      </div>

      {currentBill ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tagihan Bulanan
                <Badge variant={currentBill.isPaid ? "default" : "secondary"}>
                  {currentBill.isPaid ? "Lunas" : "Belum Lunas"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {getMonthName(currentBill.month)} {currentBill.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tagihan</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentBill.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(calculateRemainingAmount())}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="font-semibold">Riwayat Pembayaran</h3>
                {currentBill.payments.length > 0 ? (
                  currentBill.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{getPaymentTypeLabel(payment.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(payment.createdAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Belum ada pembayaran</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {!currentBill.isPaid && calculateRemainingAmount() > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bayar Tagihan</CardTitle>
                  <CardDescription>
                    Pilih metode pembayaran yang Anda inginkan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push("/member/pay/full")}
                  >
                    Bayar Penuh ({formatCurrency(calculateRemainingAmount())})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push("/member/pay/installment")}
                  >
                    Bayar Cicilan
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pembayaran</CardTitle>
                <CardDescription>
                  Lihat semua riwayat pembayaran Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/member/history")}
                >
                  Lihat Riwayat
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Tidak ada tagihan aktif</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}