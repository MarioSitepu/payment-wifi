"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Bill {
  id: string
  amount: number
  month: number
  year: number
  payments: Array<{
    amount: number
    status: string
  }>
}

export default function FullPaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchCurrentBill()
  }, [session, status, router])

  const fetchCurrentBill = async () => {
    try {
      const response = await fetch("/api/bills/current")
      if (response.ok) {
        const billData = await response.json()
        setBill(billData)
        
        // Calculate remaining amount
        const paidAmount = billData.payments
          .filter((p: any) => p.status === "APPROVED")
          .reduce((sum: number, p: any) => sum + p.amount, 0)
        const remainingAmount = billData.amount - paidAmount
        setAmount(remainingAmount.toString())
      } else {
        toast.error("Gagal memuat data tagihan")
        router.push("/member")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      router.push("/member")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bill || !receiptFile) {
      toast.error("Silakan upload bukti pembayaran", {
        duration: 5000,
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      })
      return
    }

    const paymentAmount = parseInt(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Jumlah pembayaran tidak valid", {
        duration: 5000,
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      })
      return
    }

    setSubmitting(true)

    try {
      // Upload receipt first
      const formData = new FormData()
      formData.append("receipt", receiptFile)

      const uploadResponse = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({} as any))
        const errorMsg = err?.message || "Gagal upload bukti pembayaran"
        toast.error(errorMsg, {
          duration: 5000,
          style: {
            backgroundColor: '#ef4444',
            color: 'white',
            border: '1px solid #dc2626'
          }
        })
        throw new Error(errorMsg)
      }

      const { receiptUrl } = await uploadResponse.json()

      // Create payment
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billId: bill.id,
          amount: paymentAmount,
          type: "FULL",
          receiptUrl,
          notes,
        }),
      })

      if (paymentResponse.ok) {
        const successMsg = "Pembayaran berhasil dikirim! Menunggu verifikasi admin."
        toast.success(successMsg, {
          duration: 5000,
          style: {
            backgroundColor: '#22c55e',
            color: 'white',
            border: '1px solid #16a34a'
          }
        })
        setTimeout(() => router.push("/member"), 2000)
      } else {
        const error = await paymentResponse.json()
        const msg = error.message || "Gagal membuat pembayaran"
        toast.error(msg, {
          duration: 5000,
          style: {
            backgroundColor: '#ef4444',
            color: 'white',
            border: '1px solid #dc2626'
          }
        })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses pembayaran"
      toast.error(msg, {
        duration: 5000,
        style: {
          backgroundColor: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626'
        }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Data tagihan tidak ditemukan</p>
            <Button className="mt-4" onClick={() => router.push("/member")}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push("/member")}
        >
          ← Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pembayaran Penuh</CardTitle>
          <CardDescription>
            Upload bukti pembayaran untuk tagihan bulanan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Tagihan:</span>
              <Badge variant="secondary">{formatCurrency(bill.amount)}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pembayaran</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1000"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Bukti Pembayaran</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Upload screenshot bukti transfer (PNG, JPG, maksimal 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Kirim Pembayaran"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/member")}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}