import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe auth config — NO Prisma/PrismaClient imports here.
 * Used by middleware (Edge runtime) and spread into the full auth config.
 * JWT session strategy avoids touching the DB on every request.
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    // Persist user.id into the JWT on first sign-in (full logic overridden in auth.ts)
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    // Expose id and onboardingCompleted from JWT to the session object
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      (session.user as { onboardingCompleted?: boolean }).onboardingCompleted =
        (token.onboardingCompleted as boolean) ?? false;
      return session;
    },
  },
} satisfies NextAuthConfig;
