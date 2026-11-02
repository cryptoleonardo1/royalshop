import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 1. Admin host (ADMIN_HOST, e.g. admin.shop.royalstroje.sk): its root redirects to /admin. The storefront
//    host keeps /admin reachable too until the domains are set up.
// 2. Pages that read the signed-in user (/admin, /ucet, the order page and checkout) refresh the Supabase
//    session cookie here: Server Components cannot write cookies, so a rotated refresh token would be lost.
//    Authorization itself is checked in every page and server action (src/lib/admin/auth.ts,
//    src/lib/account/auth.ts), never only here.

const PUBLIC_ADMIN = ["/admin/prihlasenie"];
const PUBLIC_ACCOUNT = ["/ucet/prihlasenie", "/ucet/registracia"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const adminHost = process.env.ADMIN_HOST;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (adminHost && host === adminHost && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/") return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-out visitors go straight to the login (UX only; access checks stay in pages and actions).
  if (!user && pathname.startsWith("/admin") && !PUBLIC_ADMIN.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin/prihlasenie", request.url));
  }
  if (!user && pathname.startsWith("/ucet") && !PUBLIC_ACCOUNT.includes(pathname)) {
    const login = new URL("/ucet/prihlasenie", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return response;
}

// The rest of the storefront stays proxy-free (no extra hop); "/" catches the admin host's root.
export const config = {
  matcher: ["/", "/admin/:path*", "/ucet/:path*", "/objednavka/:path*", "/pokladna"],
};
