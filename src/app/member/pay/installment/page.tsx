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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
    type: string
  }>
}

export default function InstallmentPaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [installmentType, setInstallmentType] = useState("INSTALLMENT_1")
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

  const calculateRemainingAmount = () => {
    if (!bill) return 0
    const paidAmount = bill.payments
      .filter((p: any) => p.status === "APPROVED")
      .reduce((sum: number, p: any) => sum + p.amount, 0)
    return bill.amount - paidAmount
  }

  const getExistingInstallments = () => {
    if (!bill) return []
    return bill.payments.filter((p: any) => 
      p.type === "INSTALLMENT_1" || p.type === "INSTALLMENT_2"
    )
  }

  const getAvailableInstallmentTypes = () => {
    const existing = getExistingInstallments()
    const types = []
    
    if (!existing.find((p: any) => p.type === "INSTALLMENT_1")) {
      types.push("INSTALLMENT_1")
    }
    if (!existing.find((p: any) => p.type === "INSTALLMENT_2")) {
      types.push("INSTALLMENT_2")
    }
    
    return types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bill || !receiptFile) {
      toast.error("Silakan upload bukti pembayaran")
      return
    }

    const paymentAmount = parseInt(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Jumlah pembayaran tidak valid")
      return
    }

    const remainingAmount = calculateRemainingAmount()
    if (paymentAmount > remainingAmount) {
      toast.error(`Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(remainingAmount)})`)
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
        throw new Error("Gagal upload bukti pembayaran")
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
          type: installmentType,
          receiptUrl,
          notes,
        }),
      })

      if (paymentResponse.ok) {
        toast.success("Pembayaran cicilan berhasil dikirim! Menunggu verifikasi admin.")
        router.push("/member")
      } else {
        const error = await paymentResponse.json()
        toast.error(error.message || "Gagal membuat pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses pembayaran")
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

  const availableTypes = getAvailableInstallmentTypes()
  const remainingAmount = calculateRemainingAmount()

  if (availableTypes.length === 0) {
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
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Anda sudah melakukan 2 kali cicilan untuk bulan ini
            </p>
            <Button onClick={() => router.push("/member")}>
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
          <CardTitle>Pembayaran Cicilan</CardTitle>
          <CardDescription>
            Bayar tagihan Anda dengan mencicil maksimal 2 kali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Tagihan:</span>
              <Badge variant="secondary">{formatCurrency(bill.amount)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Sisa Tagihan:</span>
              <Badge variant="outline">{formatCurrency(remainingAmount)}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Cicilan</Label>
              <RadioGroup value={installmentType} onValueChange={setInstallmentType}>
                {availableTypes.includes("INSTALLMENT_1") && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INSTALLMENT_1" id="installment1" />
                    <Label htmlFor="installment1">Cicilan 1</Label>
                  </div>
                )}
                {availableTypes.includes("INSTALLMENT_2") && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INSTALLMENT_2" id="installment2" />
                    <Label htmlFor="installment2">Cicilan 2</Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pembayaran</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1000"
                max={remainingAmount}
                step="1000"
                placeholder={`Maksimal ${formatCurrency(remainingAmount)}`}
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