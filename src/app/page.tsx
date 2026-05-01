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
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-info/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-xl border border-border/30 shadow-sm mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">Now in Ghana</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight leading-[1.05] animate-slide-up">
              Inventory & Sales Management
              <span className="gradient-text block mt-3">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Streamline your operations with our all-in-one platform. Track inventory, process sales, manage customers, and grow your business.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base shadow-glow hover:shadow-glow-soft transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  See Features
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="mt-20 max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="absolute inset-0 pattern-grid opacity-30" />
              
              <div className="relative flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/50">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/50">
                  <span className="text-xs text-muted-foreground font-mono">stockmanage.app/dashboard</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Today's Sales", value: "GHS 12,450", change: "+12%", positive: true },
                    { label: "Orders", value: "156", change: "+8%", positive: true },
                    { label: "Customers", value: "89", change: "+5%", positive: true },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary/70 hover:border-border/50 transition-all duration-200">
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1.5">{stat.value}</p>
                      <p className={`text-xs font-medium mt-1.5 ${stat.positive ? 'text-success' : 'text-destructive'}`}>{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="h-40 rounded-xl bg-secondary/30 border border-border/30 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 pattern-dots opacity-20" />
                  <div className="relative flex flex-col items-center gap-3">
                    <TrendingUp className="h-12 w-12 text-primary/40" />
                    <p className="text-sm font-medium text-muted-foreground">Revenue Analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-border/30 relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-50" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Powerful features designed specifically for Ghanaian businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30" />
        <div className="absolute inset-0 pattern-grid opacity-20" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Trusted by Businesses Across Ghana
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              See what shop owners are saying about Stock Manage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="h-5 w-5 fill-warning text-warning" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-5">&quot;{testimonial.content}&quot;</p>
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
          <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pattern-grid opacity-30" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            
            <div className="relative grid lg:grid-cols-2 gap-0">
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Ready to Transform Your Business?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  Join hundreds of Ghanaian businesses already using Stock Manage to grow their operations.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="gap-2 h-12 px-8 shadow-glow">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Schedule Demo
                  </Button>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-10 md:p-14 flex items-center justify-center">
                <div className="relative text-center">
                  <div className="text-6xl font-bold gradient-text">500+</div>
                  <p className="mt-2 text-lg text-muted-foreground">Businesses in Ghana</p>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 w-10 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">And many more joining...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-16 relative">
        <div className="absolute inset-0 bg-secondary/20" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">Stock Manage</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Modern inventory & sales management for Ghanaian businesses. Streamline operations and grow your business.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            &copy; 2024 Stock Manage. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
