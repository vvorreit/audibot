import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as Record<string, unknown> | null;
    const { pathname } = req.nextUrl;

    // DPA non accepté → forcer la signature (tous les utilisateurs)
    if (
      token &&
      token.dpaAccepted !== true &&
      !pathname.startsWith("/auth/dpa-required") &&
      !pathname.startsWith("/auth/signout") &&
      !pathname.startsWith("/legal") &&
      !pathname.startsWith("/api/auth")
    ) {
      return NextResponse.redirect(new URL("/auth/dpa-required", req.url));
    }

    // CGV non acceptées → forcer la signature (tous les utilisateurs)
    if (
      token &&
      token.cgvAccepted !== true &&
      !pathname.startsWith("/auth/cgv-required") &&
      !pathname.startsWith("/auth/dpa-required") &&
      !pathname.startsWith("/auth/signout") &&
      !pathname.startsWith("/legal") &&
      !pathname.startsWith("/api/auth")
    ) {
      return NextResponse.redirect(new URL("/auth/cgv-required", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tiers-payant/:path*",
    "/admin/:path*",
  ],
};
