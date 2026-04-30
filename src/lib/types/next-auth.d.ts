import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    shop?: string
    shopName?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      shop?: string
      shopName?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    shop: string
    shopName: string
  }
}