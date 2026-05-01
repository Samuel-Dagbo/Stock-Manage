"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Clock, Mail, ArrowLeft, Shield, CheckCircle2, Loader2, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useToast } from "@/lib/hooks/use-toast"

export default function PendingApprovalPage() {
  const [checking, setChecking] = useState(true)
  const { toast } = useToast()

  const [timeLeft, setTimeLeft] = useState(30)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,150,105,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]" />

      <Card className="w-full max-w-md relative z-10 border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Your account has been created but requires approval from an administrator before you can access the dashboard.
          </p>

          <div className="rounded-xl bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Contact the admin to approve your account</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-4 w-4 text-accent" />
              </div>
              <span className="text-foreground">Once approved, you&apos;ll be assigned a role</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <Zap className="h-4 w-4 text-success" />
              </div>
              <span className="text-foreground">You&apos;ll be notified once approved</span>
            </div>
          </div>

          <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
            <div className="flex items-center justify-center gap-2 text-warning text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Waiting for admin approval...</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}