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
  Store
} from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, automate reorders, and get low-stock alerts. Never run out of popular items again.",
  },
  {
    icon: Receipt,
    title: "POS System",
    description: "Lightning-fast point of sale with barcode scanning, multiple payment methods, and receipt generation.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Real-time insights into sales, profits, and trends. Make data-driven decisions effortlessly.",
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Build customer loyalty with purchase history, loyalty points, and WhatsApp integration.",
  },
  {
    icon: Smartphone,
    title: "Mobile Money Integration",
    description: "Accept MTN MoMo, Telecel Cash, and AirtelTigo payments seamlessly.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is protected with enterprise-grade security. Access from any device.",
  },
]

const testimonials = [
  {
    name: "Kwame Asante",
    role: "Owner, Asante Supermarket",
    content: "Stock Manage transformed how we run our supermarket. Inventory tracking is now effortless and we've reduced stockouts by 80%.",
  },
  {
    name: "Adwoa Mensah",
    role: "Manager, Pharma Plus",
    content: "The POS system is incredibly fast. Our checkout time has decreased significantly and customers love the quick service.",
  },
  {
    name: "Emmanuel Osei",
    role: "Director, Osei Electronics",
    content: "The mobile money integration is a game-changer. We now accept all payment methods and our sales have increased by 40%.",
  },
]

const stats = [
  { value: "500+", label: "Businesses" },
  { value: "50K+", label: "Transactions" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
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
