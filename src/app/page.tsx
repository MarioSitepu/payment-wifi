"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      if (session.user.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/member")
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-100">

      
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          WiFi Payment Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistem pembayaran WiFi bulanan dengan opsi cicilan
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Member
            </CardTitle>
            <CardDescription>
              Untuk pengguna WiFi yang ingin membayar tagihan bulanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Lihat tagihan bulan berjalan</li>
              <li>• Bayar langsung atau cicil 2 kali</li>
              <li>• Upload bukti pembayaran</li>
              <li>• Lihat riwayat pembayaran</li>
            </ul>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => router.push("/auth/signin")}
              >
                Login Member
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/auth/signup")}
              >
                Registrasi Member
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👨‍💼</span>
              Admin
            </CardTitle>
            <CardDescription>
              Untuk administrator mengelola pembayaran dan user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Verifikasi pembayaran member</li>
              <li>• Kelola data user</li>
              <li>• Atur jumlah tagihan bulanan</li>
              <li>• Export riwayat pembayaran</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => router.push("/auth/signin")}
            >
              Login Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}