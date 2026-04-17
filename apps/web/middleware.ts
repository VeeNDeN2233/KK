import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/authSecret";

export default async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl;
  let token: Awaited<ReturnType<typeof getToken>> | null = null;
  let tokenDecryptFailed = false;
  try {
    token = await getToken({ req, secret: getAuthSecret() });
  } catch {
    tokenDecryptFailed = true;
    token = null;
  }
  const isAuthed = !!token;

  const protectedPrefixes = ["/me", "/messages", "/users"];
  const isProtected = protectedPrefixes.some((p) => nextUrl.pathname.startsWith(p));

  if (tokenDecryptFailed) {
    // Stale/invalid next-auth cookies (e.g. NEXTAUTH_SECRET changed) can cause repeated
    // decrypt errors. Clear common cookie names to self-heal.
    const res = NextResponse.next();
    const opts = { path: "/" as const, maxAge: 0 };
    res.cookies.set("next-auth.session-token", "", opts);
    res.cookies.set("__Secure-next-auth.session-token", "", opts);
    res.cookies.set("next-auth.csrf-token", "", opts);
    res.cookies.set("__Host-next-auth.csrf-token", "", opts);
    return res;
  }

  if (isProtected && !isAuthed) {
    const url = new URL("/auth/login", nextUrl);
    url.searchParams.set("next", nextUrl.pathname);
    return Response.redirect(url);
  }

  return;
}

export const config = {
  matcher: ["/me", "/me/:path*", "/messages", "/messages/:path*", "/users", "/users/:path*"],
};

