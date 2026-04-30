"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Store, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Moon, Sun } from "lucide-react"
import { signIn } from "next-auth/react"
import { useUIStore } from "@/lib/stores/ui-store"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { theme, setTheme } = useUIStore()

  const getNextTheme = () => {
    if (theme === "light") return "dark"
    if (theme === "dark") return "system"
    return "light"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "pending") {
          router.push("/pending")
        } else if (result.error === "inactive") {
          setError("Your account has been deactivated. Contact admin.")
        } else {
          setError("Invalid email or password")
        }
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" })
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
            Welcome back
          </h1>
          <p className="text-white/70 text-[13px] max-w-sm leading-relaxed">
            Sign in to manage your inventory, process sales, and grow your business.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { label: "Active Users", value: "500+" },
              { label: "Stores", value: "1,200+" },
              { label: "Transactions", value: "2M+" },
              { label: "Up-time", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-3.5">
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-[11px] mt-0.5">{stat.label}</p>
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
              <CardTitle className="text-sm font-semibold">Sign in</CardTitle>
              <CardDescription className="text-[13px]">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registered && (
                <div className="mb-3.5 p-2.5 rounded-md bg-success/10 text-success text-[13px] flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Account created! Please wait for admin approval.
                </div>
              )}
              {error && (
                <div className="mb-3.5 p-2.5 rounded-md bg-destructive/10 text-destructive text-[13px]">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3.5">
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
                  <Label htmlFor="password" className="text-[13px]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[13px]">
                    <input type="checkbox" className="rounded border-input h-3.5 w-3.5" />
                    <span>Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-[13px] text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="relative my-5">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={handleGoogleLogin}>
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
                Google
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <p className="text-[13px] text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
