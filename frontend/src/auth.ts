import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Full auth config — Node.js runtime only.
 * Spreads the Edge-safe config and adds PrismaAdapter so users/accounts
 * are persisted to MongoDB while sessions remain as JWTs (Edge-compatible).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});
