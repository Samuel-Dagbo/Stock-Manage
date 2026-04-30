import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import * as dotenv from "dotenv"
import path from "path"

// Load .env from project root - go up 4 levels from src/lib/db
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

console.log("Working directory:", process.cwd())
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Found ✓" : "Not found")

import { connectDB } from "./connection"
import { User, Shop, Product, Category, Customer, Supplier, Sale, Expense } from "./models"

// Sample images from Pexels (free, no attribution needed)
const productImages = {
  gin: "https://images.pexels.com/photos/6657948/pexels-photo-6657948.jpeg?auto=compress&cs=tinysrgb&w=400",
  whisky: "https://images.pexels.com/photos/6657952/pexels-photo-6657952.jpeg?auto=compress&cs=tinysrgb&w=400",
  coke: "https://images.pexels.com/photos/2945516/pexels-photo-2945516.jpeg?auto=compress&cs=tinysrgb&w=400",
  indomie: "https://images.pexels.com/photos/15805517/pexels-photo-15805517.jpeg?auto=compress&cs=tinysrgb&w=400",
  milo: "https://images.pexels.com/photos/1352251/pexels-photo-1352251.jpeg?auto=compress&cs=tinysrgb&w=400",
  detergent: "https://images.pexels.com/photos/4058373/pexels-photo-4058373.jpeg?auto=compress&cs=tinysrgb&w=400",
  sugar: "https://images.pexels.com/photos/5947379/pexels-photo-5947379.jpeg?auto=compress&cs=tinysrgb&w=400",
  oil: "https://images.pexels.com/photos/1433358/pexels-photo-1433358.jpeg?auto=compress&cs=tinysrgb&w=400",
  shampoo: "https://images.pexels.com/photos/3971783/pexels-photo-3971783.jpeg?auto=compress&cs=tinysrgb&w=400",
  water: "https://images.pexels.com/photos/2920064/pexels-photo-2920064.jpeg?auto=compress&cs=tinysrgb&w=400",
  biscuits: "https://images.pexels.com/photos/1352259/pexels-photo-1352259.jpeg?auto=compress&cs=tinysrgb&w=400",
  soap: "https://images.pexels.com/photos/4114335/pexels-photo-4114335.jpeg?auto=compress&cs=tinysrgb&w=400",
}

async function seed() {
  try {
    await connectDB()
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Shop.deleteMany({})
    await Product.deleteMany({})
    await Category.deleteMany({})
    await Customer.deleteMany({})
    await Supplier.deleteMany({})
    await Sale.deleteMany({})
    await Expense.deleteMany({})
    console.log("Cleared existing data")

    // Create admin user first (we'll link to shop after shop is created)
    const hashedPassword = await bcrypt.hash("password123", 12)
    let adminUser = await User.create({
      name: "Store Admin",
      email: "admin@stockmanage.com",
      password: hashedPassword,
      role: "owner",
      isActive: true,
      isApproved: true, // Admin is pre-approved
    })
    console.log("Created admin user:", adminUser.email)

    // Create shop with owner
    const shop = await Shop.create({
      name: "Accra Central Store",
      slug: "accra-central-store",
      type: "supermarket",
      address: "Central Market, Accra",
      phone: "+233 24 123 4567",
      email: "accrastore@example.com",
      currency: "GHS",
      locale: "en-GH",
      taxRate: 15,
      isActive: true,
      owner: adminUser._id,
      receiptSettings: {
        showLogo: true,
        showAddress: true,
        showPhone: true,
        footerMessage: "Thank you for your business!",
        terms: "No refunds on opened items",
      },
    })
    console.log("Created shop:", shop.name)

    // Link user to shop
    await User.findByIdAndUpdate(
      adminUser._id,
      { shop: shop._id, isApproved: true },
      { new: true }
    )

    // Create categories
    const categories = await Category.insertMany([
      { name: "Groceries", slug: "groceries", shop: shop._id },
      { name: "Beverages", slug: "beverages", shop: shop._id },
      { name: "Spirits", slug: "spirits", shop: shop._id },
      { name: "Household", slug: "household", shop: shop._id },
      { name: "Snacks", slug: "snacks", shop: shop._id },
      { name: "Personal Care", slug: "personal-care", shop: shop._id },
    ])
    console.log("Created categories:", categories.length)

    // Create products with images
    const products = await Product.insertMany([
      {
        name: "Royal Crown Gin 750ml",
        sku: "RCG-750-001",
        barcode: "123456789012",
        category: categories[2]._id, // Spirits
        description: "Premium Ghanaian gin 750ml",
        costPrice: 85,
        sellingPrice: 120,
        stockQuantity: 23,
        reorderLevel: 20,
        unitType: "bottle",
        shop: shop._id,
        isActive: true,
        images: [productImages.gin],
      },
      {
        name: "Coca Cola Pack (24)",
        sku: "CCK-024-001",
        barcode: "123456789013",
        category: categories[1]._id, // Beverages
        description: "Coca Cola 330ml x 24 pack",
        costPrice: 38,
        sellingPrice: 48,
        stockQuantity: 156,
        reorderLevel: 50,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.coke],
      },
      {
        name: "Indomie Pack (40)",
        sku: "IDM-040-001",
        barcode: "123456789014",
        category: categories[4]._id, // Snacks
        description: "Indomie instant noodles 40 pack",
        costPrice: 32,
        sellingPrice: 40,
        stockQuantity: 234,
        reorderLevel: 100,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.indomie],
      },
      {
        name: "Milo 400g Tin",
        sku: "MLO-400-001",
        barcode: "123456789015",
        category: categories[1]._id, // Beverages
        description: "Nestle Milo 400g tin",
        costPrice: 55,
        sellingPrice: 70,
        stockQuantity: 12,
        reorderLevel: 50,
        unitType: "tin",
        shop: shop._id,
        isActive: true,
        images: [productImages.milo],
      },
      {
        name: "Omo Detergent Powder 1kg",
        sku: "OMO-001-001",
        barcode: "123456789016",
        category: categories[3]._id, // Household
        description: "Omo laundry detergent 1kg",
        costPrice: 25,
        sellingPrice: 35,
        stockQuantity: 89,
        reorderLevel: 30,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.detergent],
      },
      {
        name: "Sugar 1kg",
        sku: "SGR-001-001",
        barcode: "123456789017",
        category: categories[0]._id, // Groceries
        description: "Granulated sugar 1kg",
        costPrice: 12,
        sellingPrice: 18,
        stockQuantity: 0,
        reorderLevel: 50,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.sugar],
      },
      {
        name: "Beverly Hills Oil 500ml",
        sku: "BHO-500-001",
        barcode: "123456789018",
        category: categories[0]._id, // Groceries
        description: "Beverly Hills cooking oil 500ml",
        costPrice: 45,
        sellingPrice: 65,
        stockQuantity: 67,
        reorderLevel: 40,
        unitType: "bottle",
        shop: shop._id,
        isActive: true,
        images: [productImages.oil],
      },
      {
        name: "Tide Detergent 1kg",
        sku: "TIDE-001-001",
        barcode: "123456789019",
        category: categories[3]._id, // Household
        description: "Tide laundry detergent 1kg",
        costPrice: 28,
        sellingPrice: 42,
        stockQuantity: 45,
        reorderLevel: 30,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.detergent],
      },
      {
        name: "Royal Crown Whisky 750ml",
        sku: "RCW-750-001",
        barcode: "123456789020",
        category: categories[2]._id, // Spirits
        description: "Premium whisky 750ml",
        costPrice: 100,
        sellingPrice: 150,
        stockQuantity: 8,
        reorderLevel: 15,
        unitType: "bottle",
        shop: shop._id,
        isActive: true,
        images: [productImages.whisky],
      },
      {
        name: "Dove Shampoo 400ml",
        sku: "DOV-400-001",
        barcode: "123456789021",
        category: categories[5]._id, // Personal Care
        description: "Dove shampoo 400ml",
        costPrice: 22,
        sellingPrice: 32,
        stockQuantity: 56,
        reorderLevel: 25,
        unitType: "bottle",
        shop: shop._id,
        isActive: true,
        images: [productImages.shampoo],
      },
      {
        name: "Pepsi Pack (24)",
        sku: "PEP-024-001",
        barcode: "123456789022",
        category: categories[1]._id, // Beverages
        description: "Pepsi 330ml x 24 pack",
        costPrice: 35,
        sellingPrice: 45,
        stockQuantity: 80,
        reorderLevel: 40,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.coke],
      },
      {
        name: "Lux Soap (12 bars)",
        sku: "LUX-012-001",
        barcode: "123456789023",
        category: categories[5]._id, // Personal Care
        description: "Lux soap 12 bars pack",
        costPrice: 18,
        sellingPrice: 28,
        stockQuantity: 120,
        reorderLevel: 50,
        unitType: "pack",
        shop: shop._id,
        isActive: true,
        images: [productImages.soap],
      },
    ])
    console.log("Created products:", products.length)

    // Create customers
    const customers = await Customer.insertMany([
      {
        name: "Kwame Asante",
        email: "kwame.asante@email.com",
        phone: "+233244123456",
        shop: shop._id,
        totalSpent: 12500,
        loyaltyPoints: 1250,
        isActive: true,
      },
      {
        name: "Adwoa Mensah",
        email: "adwoa.mensah@email.com",
        phone: "+233244234567",
        shop: shop._id,
        totalSpent: 8900,
        loyaltyPoints: 890,
        isActive: true,
      },
      {
        name: "Emmanuel Osei",
        email: "emmanuel.osei@email.com",
        phone: "+233244345678",
        shop: shop._id,
        totalSpent: 15600,
        loyaltyPoints: 1560,
        isActive: true,
      },
      {
        name: "Abena Nyarko",
        email: "abena.nyarko@email.com",
        phone: "+233244456789",
        shop: shop._id,
        totalSpent: 5400,
        loyaltyPoints: 540,
        isActive: true,
      },
      {
        name: "John Kofi",
        email: "john.kofi@email.com",
        phone: "+233244567890",
        shop: shop._id,
        totalSpent: 7800,
        loyaltyPoints: 780,
        isActive: true,
      },
    ])
    console.log("Created customers:", customers.length)

    // Create suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: "Ghana Distributors Ltd",
        contactPerson: "Mr. Asare",
        email: "orders@ghanadist.com",
        phone: "+233302123456",
        address: "Industrial Area, Accra",
        shop: shop._id,
        isActive: true,
      },
      {
        name: "Accra Wholesale Co.",
        contactPerson: "Mrs. Agyeman",
        email: "sales@accrawholesale.com",
        phone: "+233302234567",
        address: "Central Market, Accra",
        shop: shop._id,
        isActive: true,
      },
      {
        name: "Household Imports Ghana",
        contactPerson: "Mr. Kweku",
        email: "info@householdimports.com",
        phone: "+233302345678",
        address: "Tema, Accra",
        shop: shop._id,
        isActive: true,
      },
    ])
    console.log("Created suppliers:", suppliers.length)

    // Create expenses
    const expenses = await Expense.insertMany([
      {
        description: "Shop Rent - February 2026",
        amount: 2500,
        category: "rent",
        date: new Date("2026-02-01"),
        shop: shop._id,
        recordedBy: adminUser._id,
        isActive: true,
      },
      {
        description: "Electricity Bill",
        amount: 450,
        category: "utilities",
        date: new Date("2026-01-28"),
        shop: shop._id,
        recordedBy: adminUser._id,
        isActive: true,
      },
      {
        description: "Staff Salaries",
        amount: 3500,
        category: "salaries",
        date: new Date("2026-01-31"),
        shop: shop._id,
        recordedBy: adminUser._id,
        isActive: true,
      },
      {
        description: "Marketing - Flyers",
        amount: 200,
        category: "marketing",
        date: new Date("2026-01-25"),
        shop: shop._id,
        recordedBy: adminUser._id,
        isActive: true,
      },
      {
        description: "Cleaning Supplies",
        amount: 150,
        category: "supplies",
        date: new Date("2026-01-20"),
        shop: shop._id,
        recordedBy: adminUser._id,
        isActive: true,
      },
    ])
    console.log("Created expenses:", expenses.length)

    console.log("\n✅ Seed completed successfully!")
    console.log("\nLogin credentials:")
    console.log("  Email: admin@stockmanage.com")
    console.log("  Password: password123")

  } catch (error) {
    console.error("Seed error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seed()