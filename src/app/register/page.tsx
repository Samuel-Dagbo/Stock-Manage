"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Store, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle2, Moon, Sun, ArrowRight, Sparkles, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/lib/hooks/use-toast"
import { useUIStore } from "@/lib/stores/ui-store"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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
    setError("")

    // Client-side password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Admin goes to login, others wait for approval
      if (data.role === "admin") {
        toast.success("Welcome! Your admin account is ready.")
        router.push("/login?registered=true")
      } else {
        toast.success("Account created! Waiting for admin approval.")
        router.push("/pending")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const features = [
    "14-day free trial",
    "No credit card required",
    "Set up in 5 minutes",
    "Cancel anytime",
  ]

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_50%)]" />
      
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                  <Store className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-base">
                Start your 14-day free trial
              </CardDescription>
</CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-xl border-border/60 bg-background px-4"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 rounded-xl border-border/60 bg-background px-4"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 rounded-xl border-border/60 bg-background px-4"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-11 rounded-xl border-border/60 bg-background px-4 pr-12"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <Separator />

              <div className="space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-success/10">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Theme Switcher */}
          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-accent/80 hover:text-foreground"
              onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")}
            >
              {theme === "light" && <Sun className="h-4 w-4" />}
              {theme === "dark" && <Moon className="h-4 w-4" />}
              {theme === "system" && <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 flex-col justify-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-success/20 blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Stock Manage</h2>
              <p className="text-sm text-muted-foreground">Premium Edition</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Grow your business</span>{" "}
            <span className="text-primary">with confidence</span>
          </h1>

          <div className="space-y-4 mb-8">
            {["Smart inventory tracking", "Lightning-fast POS", "Advanced analytics", "Mobile money integration"].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-success/10 border border-border/60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Join 500+ businesses</p>
                <p className="text-xs text-muted-foreground">Already using Stock Manage to grow</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}