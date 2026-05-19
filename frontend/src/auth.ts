import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
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
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // Persist user.id into the JWT on first sign-in
      if (user?.id) token.id = user.id;

      // Check onboarding status from DB on first sign-in or explicit refresh
      if (user?.id || trigger === "update") {
        const userId = (token.id as string) ?? user?.id;
        if (userId) {
          const prefs = await prisma.userPreferences.findUnique({
            where: { userId },
            select: {
              focusTime: true,
              workStyle: true,
              focusDuration: true,
              taskType: true,
            },
          });
          // Onboarding is complete only when all required fields are filled
          token.onboardingCompleted =
            !!prefs &&
            !!prefs.focusTime &&
            !!prefs.workStyle &&
            !!prefs.focusDuration &&
            !!prefs.taskType;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      session.user.onboardingCompleted =
        (token.onboardingCompleted as boolean) ?? false;
      return session;
    },
  },
});
