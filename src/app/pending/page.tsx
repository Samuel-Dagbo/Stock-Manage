"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Clock, Mail, ArrowLeft, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useUIStore } from "@/lib/stores/ui-store"

export default function PendingApprovalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const getNextTheme = () => {
    if (theme === "light") return "dark"
    if (theme === "dark") return "system"
    return "light"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,150,105,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <Card className="w-full max-w-md relative z-10 border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl text-white">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-slate-400">
            Your account has been created but requires approval from an administrator before you can access the dashboard.
          </p>

          <div className="rounded-xl bg-slate-800/50 p-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Contact the shop admin to approve your account</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Zap className="h-4 w-4 text-slate-500" />
              <span className="text-sm">You will be notified once your account is approved</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-400">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}