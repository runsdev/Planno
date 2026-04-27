import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/planner") ||
        nextUrl.pathname.startsWith("/onboarding") ||
        nextUrl.pathname.startsWith("/settings");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/auth/login", nextUrl));
      }
      return true;
    },
  },
});
