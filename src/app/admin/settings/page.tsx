"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface SystemSettings {
  id: string
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [billAmount, setBillAmount] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const settingsData = await response.json()
        setSettings(settingsData)
        
        // Find default bill amount
        const billAmountSetting = settingsData.find(s => s.key === "default_bill_amount")
        if (billAmountSetting) {
          setBillAmount(billAmountSetting.value)
        } else {
          setBillAmount("67000") // Default value
        }
      } else {
        toast.error("Gagal memuat pengaturan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "default_bill_amount",
          value: billAmount,
          description: "Jumlah default tagihan WiFi bulanan"
        }),
      })

      if (response.ok) {
        toast.success("Pengaturan berhasil disimpan")
        fetchSettings()
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menyimpan pengaturan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setSaving(false)
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan sistem WiFi Payment Manager
          </p>
        </div>
        <Button onClick={() => router.push("/admin")}>
          ← Kembali ke Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Tagihan</CardTitle>
            <CardDescription>
              Atur jumlah default tagihan WiFi bulanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billAmount">Jumlah Tagihan Default (IDR)</Label>
              <Input
                id="billAmount"
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                min="1000"
                step="1000"
                placeholder="67000"
              />
              <p className="text-sm text-muted-foreground">
                Jumlah ini akan digunakan sebagai default untuk tagihan bulanan baru
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
            <CardDescription>
              Informasi tentang pengaturan sistem saat ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Tagihan Default Saat Ini
                </Label>
                <p className="text-lg font-semibold">
                  {formatCurrency(parseInt(billAmount) || 0)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Total Pengaturan
                </Label>
                <p className="text-lg font-semibold">{settings.length}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Pengaturan Tersimpan
              </Label>
              <div className="space-y-1">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex justify-between text-sm">
                    <span className="font-medium">{setting.key}:</span>
                    <span>{setting.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}