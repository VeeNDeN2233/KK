import { getToken } from "next-auth/jwt";

export default async function middleware(req: Request & { nextUrl: URL }) {
  const nextUrl = req.nextUrl;
  const token = await getToken({ req: req as any });
  const isAuthed = !!token;

  const protectedPrefixes = ["/me", "/messages"];
  const isProtected = protectedPrefixes.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !isAuthed) {
    const url = new URL("/auth/login", nextUrl);
    url.searchParams.set("next", nextUrl.pathname);
    return Response.redirect(url);
  }

  return;
}

export const config = {
  matcher: ["/me/:path*", "/messages/:path*"],
};

