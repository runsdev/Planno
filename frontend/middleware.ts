import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";
import { NextResponse } from "next/server";

// Use only the Edge-safe config here — no PrismaClient in the Edge runtime
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const publicPaths = ["/auth/login"];
  const isPublicPath = publicPaths.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/planner", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
