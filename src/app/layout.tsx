import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"

export const dynamic = "force-dynamic"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Stock Manage - Inventory & Sales Management for Ghanaian Businesses",
  description: "Modern inventory & sales management platform designed for shops, supermarkets, pharmacies, and businesses across Ghana.",
  keywords: "inventory management, POS system, sales tracking, Ghana business, stock management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider />
        {children}
      </body>
    </html>
  )
}