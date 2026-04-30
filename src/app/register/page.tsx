"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Store, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle2, Moon, Sun } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import { useUIStore } from "@/lib/stores/ui-store"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const { toast } = useToast()
  const { theme, setTheme } = useUIStore()

  const getNextTheme = () => {
    if (theme === "light") return "dark"
    if (theme === "dark") return "system"
    return "light"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Registration failed")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative gradient-primary p-12 flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Stock Manage</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-[28px] font-bold text-white mb-3">
            Start Managing Your Stock
          </h1>
          <p className="text-white/70 text-[13px] max-w-sm leading-relaxed">
            Create your account to start managing inventory, sales, and grow your business.
          </p>

          <div className="mt-8 space-y-2.5">
            {[
              "14-day free trial",
              "No credit card required",
              "Set up in 5 minutes",
              "Cancel anytime",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-white/70" />
                <span className="text-white/80 text-[13px]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-[11px]">
          &copy; {new Date().getFullYear()} Stock Manage. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">Stock Manage</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(getNextTheme())}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Create your account</CardTitle>
              <CardDescription className="text-[13px]">
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[13px]">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-9 h-8 text-[13px]"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[13px]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9 h-8 text-[13px]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[13px]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+233 50 000 0000"
                      className="pl-9 h-8 text-[13px]"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-9 pr-9 h-8 text-[13px]"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="relative my-5">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] text-muted-foreground">
                  or
                </span>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/dashboard")}>
                <svg className="mr-1.5 h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-[13px] text-muted-foreground text-center w-full">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
