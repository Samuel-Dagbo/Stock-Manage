"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUIStore } from "@/lib/stores/ui-store"
import { 
  ArrowRight, 
  TrendingUp, 
  Package, 
  Users, 
  BarChart3, 
  Receipt,
  Smartphone,
  CreditCard,
  Shield,
  Zap,
  Globe,
  Moon,
  Sun,
  Check,
  Store,
  Star,
  Truck,
  Wallet,
  ShoppingCart,
  Layers,
  Target,
  Rocket,
  Crown,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const features = [
  {
    icon: Package,
    title: "Smart Inventory",
    description: "AI-powered stock tracking with automated reorders and predictive analytics. Never run out of popular items.",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    icon: Receipt,
    title: "Lightning POS",
    description: "Ultra-fast point of sale with barcode scanning, split payments, and instant receipt generation.",
    gradient: "from-success/20 via-success/10 to-transparent",
    iconBg: "bg-success/10",
    iconColor: "text-success"
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Real-time insights into sales, profits, and trends. Make data-driven decisions with beautiful dashboards.",
    gradient: "from-info/20 via-info/10 to-transparent",
    iconBg: "bg-info/10",
    iconColor: "text-info"
  },
  {
    icon: Users,
    title: "Customer CRM",
    description: "Build loyalty with purchase history, automated rewards, and WhatsApp integration for seamless communication.",
    gradient: "from-warning/20 via-warning/10 to-transparent",
    iconBg: "bg-warning/10",
    iconColor: "text-warning"
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    description: "Accept MTN MoMo, Telecel Cash, and AirtelTigo payments seamlessly. No more cash handling hassles.",
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data is protected with bank-grade encryption and automated backups. Access from any device, anytime.",
    gradient: "from-destructive/10 via-transparent to-transparent",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive"
  },
]

const testimonials = [
  {
    name: "Kwame Asante",
    role: "Owner, Asante Supermarket",
    content: "Stock Manage transformed how we run our supermarket. Inventory tracking is now effortless and we've reduced stockouts by 80%. Best investment we've made!",
    avatar: "KA",
    rating: 5
  },
  {
    name: "Adwoa Mensah",
    role: "Manager, Pharma Plus",
    content: "The POS system is incredibly fast. Our checkout time has decreased significantly and customers love the quick service. Highly recommended!",
    avatar: "AM",
    rating: 5
  },
  {
    name: "Emmanuel Osei",
    role: "Director, Osei Electronics",
    content: "The mobile money integration is a game-changer. We now accept all payment methods and our sales have increased by 40% in just 3 months.",
    avatar: "EO",
    rating: 5
  },
]

const stats = [
  { value: "500+", label: "Businesses", icon: Store },
  { value: "50K+", label: "Transactions", icon: ShoppingCart },
  { value: "99.9%", label: "Uptime", icon: Shield },
  { value: "24/7", label: "Support", icon: Users },
]

const floatingIcons = [
  { icon: Package, delay: 0, duration: 20 },
  { icon: ShoppingCart, delay: 2, duration: 25 },
  { icon: BarChart3, delay: 4, duration: 30 },
  { icon: Users, delay: 1, duration: 22 },
  { icon: Receipt, delay: 3, duration: 28 },
  { icon: Wallet, delay: 5, duration: 35 },
]

export default function LandingPage() {
  const { theme, setTheme } = useUIStore()
  
  const getNextTheme = () => {
    if (theme === "light") return "dark"
    if (theme === "dark") return "system"
    return "light"
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_50%)]" />
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-muted-foreground/10"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <item.icon className="h-12 w-12" />
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Stock Manage
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <ThemeSwitcherMini />
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 inline-flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Premium Edition Now Available
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  Smart Inventory
                </span>{" "}
                <span className="text-primary">Management</span>{" "}
                <span className="text-foreground">Made Simple</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The ultimate inventory and sales management platform for Ghanaian businesses. 
                Track stock, process sales, and grow your business with powerful analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="rounded-xl gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                    Start Free Trial
                    <Rocket className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="rounded-xl gap-2">
                    Watch Demo
                    <Play className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8">
                <div className="flex -space-x-2">
                  {["AB", "CD", "EF", "GH"].map((avatar, i) => (
                    <div key={i} className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">500+</span> businesses trust us
                </div>
              </div>
            </div>
            
            {/* Hero Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/60 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-success/20 opacity-50"></div>
                <div className="relative p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-success"></div>
                      <div className="h-3 w-3 rounded-full bg-warning"></div>
                      <div className="h-3 w-3 rounded-full bg-destructive"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">Dashboard Preview</div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
                        <div className="text-xl font-bold">GHS 124,580</div>
                        <div className="text-xs text-success">+12.5% this month</div>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <div className="text-xs text-muted-foreground mb-1">Active Orders</div>
                        <div className="text-xl font-bold">24</div>
                        <div className="text-xs text-info">+3 pending</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-muted-foreground">Recent Sales</div>
                        <div className="text-xs text-primary">View all</div>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Order #{1000 + i}</div>
                                <div className="text-xs text-muted-foreground">2 items</div>
                              </div>
                            </div>
                            <div className="text-sm font-semibold">GHS {120 + i * 10}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-success/10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6">
              <Crown className="h-3 w-3 mr-1" />
              Everything You Need
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Powerful Features for Growing Businesses
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for modern retailers who demand the best. Scale from single store to enterprise seamlessly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-3xl border border-border/60 bg-card p-8 overflow-hidden hover:shadow-card-hover transition-all duration-300"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  feature.gradient
                )} />
                <div className="relative z-10">
                  <div className={cn(
                    "inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6",
                    feature.iconBg
                  )}>
                    <feature.icon className={cn("h-6 w-6", feature.iconColor)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20 lg:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Trusted by Industry Leaders
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              What Business Owners Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers who transformed their operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group"
              >
                <Card className="h-full border-border/60 hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 text-warning mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="relative py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-border/60 bg-card overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-success/20"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.3),transparent_70%)]"></div>
            </div>
            <div className="relative p-8 lg:p-16 text-center">
              <Badge variant="secondary" className="mb-6 mx-auto">
                <Rocket className="h-3 w-3 mr-1" />
                Ready to Transform Your Business?
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Start Your Free 14-Day Trial
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                No credit card required. Full access to all features. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="rounded-xl gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="rounded-xl">
                    Already Have an Account?
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Join 500+ businesses already using Stock Manage
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ThemeSwitcherMini() {
  const { theme, setTheme } = useUIStore()
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
          {theme === "light" && <Sun className="h-4 w-4" />}
          {theme === "dark" && <Moon className="h-4 w-4" />}
          {theme === "system" && <Globe className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Globe className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

  
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight">Stock Manage</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(getNextTheme())}
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[13px]">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-[13px]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-3 py-1 text-[12px]">
              <Globe className="h-3 w-3 mr-1.5" />
              Built for Ghanaian Businesses
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]">
              Inventory & Sales Management
              <span className="gradient-text block mt-2">Made Simple</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Streamline your operations with our all-in-one platform. Track inventory, process sales, manage customers, and grow your business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See Features
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-5 text-[13px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                <span className="ml-3 text-[11px] text-muted-foreground">stockmanage.app/dashboard</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Today's Sales", value: "GHS 12,450", change: "+12%" },
                    { label: "Orders", value: "156", change: "+8%" },
                    { label: "Customers", value: "89", change: "+5%" },
                  ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold mt-0.5">{stat.value}</p>
                      <p className="text-[11px] text-success mt-0.5">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-[13px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto">
              Powerful features designed specifically for Ghanaian businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-xl border border-border p-5 shadow-xs hover:shadow-md hover:border-border transition-[box-shadow,border-color] duration-200"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-subtle flex items-center justify-center mb-3">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Trusted by Businesses Across Ghana
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto">
              See what shop owners are saying about Stock Manage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-4 w-4 fill-warning text-warning" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="pt-3 mt-3 border-t border-border">
                  <p className="text-[13px] font-semibold">{testimonial.name}</p>
                  <p className="text-[12px] text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Ready to Transform Your Business?
                </h2>
                <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
                  Join hundreds of Ghanaian businesses already using Stock Manage to grow their operations.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href="/register">
                    <Button size="lg" className="gap-2">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </div>
              <div className="bg-primary-subtle p-8 md:p-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">500+</div>
                  <p className="mt-1 text-[13px] text-muted-foreground">Businesses in Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                  <Store className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold tracking-tight">Stock Manage</span>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Modern inventory & sales management for Ghanaian businesses.
              </p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-3">Product</h4>
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-3">Company</h4>
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-3">Support</h4>
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center text-[12px] text-muted-foreground">
            &copy; 2024 Stock Manage. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
