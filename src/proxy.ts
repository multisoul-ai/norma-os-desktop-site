import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/prototype/ios") {
    return NextResponse.next();
  }
  const destination = new URL(request.url);
  destination.pathname = "/prototype/ios/";
  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: "/prototype/ios",
};
