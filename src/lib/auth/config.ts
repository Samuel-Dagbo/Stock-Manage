import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectDB()

        const user = await User.findOne({
          email: credentials.email as string,
        }).populate("shop")

        if (!user || !user.password) {
          return null
        }

        const isValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // Check if user is approved
        if (!user.isApproved) {
          throw new Error("pending")
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("inactive")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          shop: (user.shop as unknown as { _id: { toString: () => string } })?._id?.toString() || "",
          shopName: (user.shop as unknown as { name?: string })?.name || "",
          isApproved: user.isApproved,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.shop = (user as { shop?: string }).shop
        token.shopName = (user as { shopName?: string }).shopName
        token.isApproved = (user as { isApproved?: boolean }).isApproved
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.shop = token.shop as string
        session.user.shopName = token.shopName as string
        ;(session.user as { isApproved?: boolean }).isApproved = token.isApproved as boolean
      }
      return session
    },
  },
})