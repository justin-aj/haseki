import { type NextRequest, NextResponse } from "next/server";

// Convenience only: sends signed-out visitors to sign in. Real access control is enforced by
// the Rust API on every /admin endpoint.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("hsk_session")) {
    const url = new URL("/account", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
