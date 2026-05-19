import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  console.log("Session in middleware:", session);
  console.log(isLoggedIn ? "User is logged in" : "User is not logged in");

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

  // Redirect new (authenticated) users who haven't completed onboarding
  const onboardingCompleted =
    (session?.user as { onboardingCompleted?: boolean })?.onboardingCompleted ??
    false;
  const isOnboardingPath = nextUrl.pathname.startsWith("/onboarding");
  if (isLoggedIn && !onboardingCompleted && !isOnboardingPath) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl.origin));
  }

  // Redirect users who completed onboarding away from that page
  if (isLoggedIn && onboardingCompleted && isOnboardingPath) {
    return NextResponse.redirect(new URL("/planner", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
