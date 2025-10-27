import { Role } from "@prisma/client"

export type UserRole = Role

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

declare module "next-auth" {
  interface Session {
    user: SessionUser
  }

  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
  }
}