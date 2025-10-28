"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

interface PaymentWithUserAndBill {
  id: string
  amount: number
  type: "FULL" | "INSTALLMENT_1" | "INSTALLMENT_2"
  status: "PENDING" | "APPROVED" | "REJECTED"
  receiptUrl?: string
  notes?: string
  createdAt: string
  user: {
    id: string
    name?: string
    email: string
  }
  bill: {
    id: string
    month: number
    year: number
    amount: number
  }
}

interface SystemStats {
  totalUsers: number
  totalBills: number
  totalPayments: number
  pendingPayments: number
  approvedPayments: number
  rejectedPayments: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentWithUserAndBill[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "ADMIN") {
      router.push("/member")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [paymentsResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/stats")
      ])

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData)
      } else {
        toast.error("Gagal memuat data pembayaran")
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        toast.error("Gagal memuat statistik")
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

  const handlePaymentAction = async (paymentId: string, action: "approve" | "reject", notes?: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, notes }),
      })

      if (response.ok) {
        toast.success(`Pembayaran berhasil ${action === "approve" ? "disetujui" : "ditolak"}`)
        fetchDashboardData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal memperbarui status pembayaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    }
  }

  const viewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl)
  }

  const handleExport = async (format: "csv" | "json", status: string = "all") => {
    try {
      const url = `/api/admin/export?format=${format}&status=${status}`
      const response = await fetch(url)
      
      if (response.ok) {
        if (format === "csv") {
          const blob = await response.blob()
          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(downloadUrl)
          toast.success("Export CSV berhasil")
        } else {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `payment-history-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(downloadUrl)
          toast.success("Export JSON berhasil")
        }
      } else {
        toast.error("Gagal melakukan export")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat export")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Selamat datang, {session?.user?.name || session?.user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/users")}
          >
            Kelola User
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/settings")}
          >
            Pengaturan
          </Button>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport("csv")}
            >
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport("json")}
            >
              Export JSON
            </Button>
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
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Menunggu ({payments.filter(p => p.status === "PENDING").length})</TabsTrigger>
          <TabsTrigger value="approved">Disetujui ({payments.filter(p => p.status === "APPROVED").length})</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak ({payments.filter(p => p.status === "REJECTED").length})</TabsTrigger>
          <TabsTrigger value="all">Semua ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Menunggu Verifikasi</CardTitle>
              <CardDescription>
                Verifikasi pembayaran yang diajukan oleh member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable 
                payments={payments.filter(p => p.status === "PENDING")}
                onAction={handlePaymentAction}
                onViewReceipt={viewReceipt}
                getMonthName={getMonthName}
                getPaymentTypeLabel={getPaymentTypeLabel}
                getStatusBadge={getStatusBadge}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Disetujui</CardTitle>
              <CardDescription>
                Daftar pembayaran yang telah disetujui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable 
                payments={payments.filter(p => p.status === "APPROVED")}
                onAction={handlePaymentAction}
                onViewReceipt={viewReceipt}
                getMonthName={getMonthName}
                getPaymentTypeLabel={getPaymentTypeLabel}
                getStatusBadge={getStatusBadge}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Ditolak</CardTitle>
              <CardDescription>
                Daftar pembayaran yang ditolak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable 
                payments={payments.filter(p => p.status === "REJECTED")}
                onAction={handlePaymentAction}
                onViewReceipt={viewReceipt}
                getMonthName={getMonthName}
                getPaymentTypeLabel={getPaymentTypeLabel}
                getStatusBadge={getStatusBadge}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semua Pembayaran</CardTitle>
              <CardDescription>
                Daftar semua pembayaran yang masuk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTable 
                payments={payments}
                onAction={handlePaymentAction}
                onViewReceipt={viewReceipt}
                getMonthName={getMonthName}
                getPaymentTypeLabel={getPaymentTypeLabel}
                getStatusBadge={getStatusBadge}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

interface PaymentTableProps {
  payments: PaymentWithUserAndBill[]
  onAction: (paymentId: string, action: "approve" | "reject", notes?: string) => void
  onViewReceipt: (receiptUrl: string) => void
  getMonthName: (month: number) => string
  getPaymentTypeLabel: (type: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  formatCurrency: (amount: number) => string
  formatDate: (date: Date) => string
}

function PaymentTable({
  payments,
  onAction,
  onViewReceipt,
  getMonthName,
  getPaymentTypeLabel,
  getStatusBadge,
  formatCurrency,
  formatDate
}: PaymentTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Bulan</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bukti</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {formatDate(new Date(payment.createdAt))}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.user.name || payment.user.email}</div>
                  <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                </div>
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
                    onClick={() => onViewReceipt(payment.receiptUrl!)}
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
              <TableCell>
                {payment.status === "PENDING" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => onAction(payment.id, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onAction(payment.id, "reject")}
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}