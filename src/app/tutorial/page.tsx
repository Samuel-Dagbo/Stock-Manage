"use client"

import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Smartphone,
  BarChart3,
  Boxes,
  Receipt,
  Wallet,
  Truck,
  Settings,
  HelpCircle,
  Play,
  BookOpen,
  Video,
  MessageCircle
} from "lucide-react"

const steps = {
  gettingStarted: [
    {
      title: "Log in to your account",
      description: "Go to the login page and enter your email and password",
      icon: Monitor,
      tips: ["Use the email you registered with", "Contact admin if you forgot your password"]
    },
    {
      title: "Set up your store profile",
      description: "Add your store name, logo, and business details in Settings",
      icon: Settings,
      tips: ["Go to Settings > Store Information", "Add your business name and contact details"]
    },
    {
      title: "Add your first products",
      description: "Start by adding products to your inventory",
      icon: Package,
      tips: ["Include product name, price, and initial stock quantity", "Add categories to organize products"]
    }
  ],
  dailySales: [
    {
      title: "Open the Point of Sale (POS)",
      description: "Click 'New Sale' or go to /pos to start a new transaction",
      icon: ShoppingCart,
      tips: ["Search for products by name or scan barcode", "Add customer details for loyalty tracking"]
    },
    {
      title: "Add items to the sale",
      description: "Select products and specify quantities",
      icon: Boxes,
      tips: ["Use +/- buttons to adjust quantities", "Press Enter to confirm each item"]
    },
    {
      title: "Apply discounts (optional)",
      description: "Add percentage or fixed amount discounts",
      icon: TrendingUp,
      tips: ["Discounts require a reason for tracking", "Maximum discount is 50%"]
    },
    {
      title: "Collect payment",
      description: "Choose payment method - Cash, Mobile Money, or Card",
      icon: Wallet,
      tips: ["Cash: Enter amount received and get change", "Momo/Card: Confirm transaction reference"]
    },
    {
      title: "Complete the sale",
      description: "Click 'Complete Sale' to finalize and print receipt",
      icon: Receipt,
      tips: ["Receipt is automatically saved", "Email or SMS receipt to customer"]
    }
  ],
  inventory: [
    {
      title: "Track stock levels",
      description: "Monitor product quantities in real-time",
      icon: Boxes,
      tips: ["View all products in /inventory", "Low stock items show in dashboard alerts"]
    },
    {
      title: "Add new products",
      description: "Create products with name, price, SKU, and category",
      icon: Plus,
      tips: ["Each product needs a unique SKU", "Set reorder level for low stock alerts"]
    },
    {
      title: "Record stock adjustments",
      description: "Track returns, damages, or manual corrections",
      icon: FileText,
      tips: ["Select reason: Return, Damage, Theft, or Correction", "Adjustments are logged in audit trail"]
    },
    {
      title: "View stock movements",
      description: "See history of all inventory changes",
      icon: BarChart3,
      tips: ["Filter by date range or product", "Track who made each adjustment"]
    }
  ],
  customers: [
    {
      title: "Add new customers",
      description: "Create customer profiles with contact info",
      icon: Users,
      tips: ["Required: Name and phone number", "Optional: Email, address, loyalty points"]
    },
    {
      title: "Track purchase history",
      description: "View all transactions per customer",
      icon: FileText,
      tips: ["Click customer name to see history", "Track loyalty points earned"]
    },
    {
      title: "Manage loyalty program",
      description: "Reward repeat customers with points",
      icon: TrendingUp,
      tips: ["Points convert to discounts", "Set points value in Settings"]
    }
  ],
  reports: [
    {
      title: "Sales reports",
      description: "View daily, weekly, or monthly sales data",
      icon: BarChart3,
      tips: ["Filter by date range", "Export to PDF or Excel"]
    },
    {
      title: "Inventory reports",
      description: "Stock levels and valuation",
      icon: Package,
      tips: ["See low stock items", "Inventory valuation report"]
    },
    {
      title: "Customer reports",
      description: "Customer analytics and trends",
      icon: Users,
      tips: ["Top customers by spending", "New vs returning customers"]
    },
    {
      title: "Expense tracking",
      description: "Record and categorize business expenses",
      icon: DollarSign,
      tips: ["Expenses reduce profit calculations", "Categories: Rent, Utilities, Supplies, etc."]
    }
  ]
}

const quickTips = [
  { label: "Press Ctrl+K to search", description: "Quickly find any product, customer, or sale" },
  { label: "Use keyboard shortcuts", description: "Speed up your workflow in POS" },
  { label: "Dark mode", description: "Toggle between light and dark themes" },
  { label: "Auto-save", description: "All data saves automatically" }
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function TutorialCard({ step, index }: { step: any, index: number }) {
  const Icon = step.icon
  return (
    <motion.div
      variants={item}
      className="group relative"
    >
      <Card className="p-5 h-full hover:shadow-lg transition-all duration-300 group-hover:border-primary/30">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {index + 1}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
            {step.tips && step.tips.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {step.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function SectionHeader({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default function TutorialPage() {
  return (
    <AppLayout title="Tutorial">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-12"
      >
        <motion.div variants={item} className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Learn the basics
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Your Stock Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple guide to help you get the most out of your inventory management system.
            Follow the steps below to learn how each feature works.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Try POS
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeader
            icon={Monitor}
            title="Getting Started"
            description="First time? Start here to set up your store"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.gettingStarted.map((step, i) => (
              <TutorialCard key={i} step={step} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeader
            icon={ShoppingCart}
            title="Making Sales (POS)"
            description="Step-by-step guide to process customer transactions"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.dailySales.map((step, i) => (
              <TutorialCard key={i} step={step} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                Quick POS Demo
              </CardTitle>
              <CardDescription>Watch how fast you can make a sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="grid gap-4 md:grid-cols-5">
                  {[
                    { step: "1", label: "Search Product", color: "from-violet-500 to-violet-600" },
                    { step: "2", label: "Add Quantity", color: "from-amber-500 to-amber-600" },
                    { step: "3", label: "Apply Discount", color: "from-cyan-500 to-cyan-600" },
                    { step: "4", label: "Select Payment", color: "from-emerald-500 to-emerald-600" },
                    { step: "5", label: "Complete Sale", color: "from-primary to-primary/70" }
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-3`}>
                        <span className="text-2xl font-bold text-white">{s.step}</span>
                      </div>
                      <p className="font-medium text-sm">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href="/pos">
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                      <ShoppingCart className="h-4 w-4" />
                      Start Making Sales
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeader
            icon={Boxes}
            title="Managing Inventory"
            description="Keep track of your products and stock levels"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.inventory.map((step, i) => (
              <TutorialCard key={i} step={step} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeader
            icon={Users}
            title="Customer Management"
            description="Build relationships with your customers"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.customers.map((step, i) => (
              <TutorialCard key={i} step={step} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <SectionHeader
            icon={BarChart3}
            title="Reports & Analytics"
            description="Make data-driven decisions for your business"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.reports.map((step, i) => (
              <TutorialCard key={i} step={step} index={i} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden border-0">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Pro Tips
              </CardTitle>
              <CardDescription>Quick tips to speed up your work</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {quickTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{tip.label}</p>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Check out our video tutorials or contact support for personalized help with any feature.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="gap-2">
              <Video className="h-4 w-4" />
              Video Tutorials
            </Button>
            <Link href="/settings">
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item} className="flex items-center justify-between py-6 border-t">
          <div className="text-sm text-muted-foreground">
            Last updated: April 2026
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                Dashboard
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="sm" className="gap-2">
                Go to POS
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}