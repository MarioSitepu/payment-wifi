"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PaymentWithBill {
  id: string
  amount: number
  type: "FULL" | "INSTALLMENT_1" | "INSTALLMENT_2"
  status: "PENDING" | "APPROVED" | "REJECTED"
  receiptUrl?: string
  notes?: string
  createdAt: string
  bill: {
    id: string
    month: number
    year: number
    amount: number
  }
}

export default function PaymentHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentWithBill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

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

    fetchPaymentHistory()
  }, [session, status, router])

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/api/payments")
      if (response.ok) {
        const paymentsData = await response.json()
        setPayments(paymentsData)
      } else {
        toast.error("Gagal memuat riwayat pembayaran")
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

  const viewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Pembayaran</h1>
          <p className="text-muted-foreground">
            Semua riwayat pembayaran Anda
          </p>
        </div>
        <Button onClick={() => router.push("/member")}>
          ← Kembali ke Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>
            Riwayat semua pembayaran yang telah Anda lakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bukti</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {formatDate(new Date(payment.createdAt))}
                      </TableCell>
                      <TableCell>
                        {getMonthName(payment.bill.month)} {payment.bill.year}
                      </TableCell>
                      <TableCell>
                        {getPaymentTypeLabel(payment.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.receiptUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewReceipt(payment.receiptUrl!)}
                          >
                            Lihat
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {payment.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex justify-center">
              <img 
                src={selectedReceipt} 
                alt="Bukti Pembayaran" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}