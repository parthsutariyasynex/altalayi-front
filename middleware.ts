import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep <img src="/images/..."> stable while serving the real files you already have.
  if (pathname === "/images/btire-logo.png") {
    return NextResponse.rewrite(new URL("/logo/btire-logo-horizontal.svg", request.url));
  }

  if (pathname === "/images/bridgestone-altalayi.png") {
    return NextResponse.rewrite(new URL("/logo/atcl-bridgestone-logo-v1.jpg", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/images/:path*"],
};

