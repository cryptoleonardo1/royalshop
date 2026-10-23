import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 1. Admin host (ADMIN_HOST, e.g. admin.shop.royalstroje.sk): its root redirects to /admin. The storefront
//    host keeps /admin reachable too until the domains are set up.
// 2. /admin requests refresh the Supabase session cookie. Authorization itself is checked in every
//    admin page and server action (src/lib/admin/auth.ts), never only here.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminHost = process.env.ADMIN_HOST;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (adminHost && host === adminHost && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (!pathname.startsWith("/admin")) return NextResponse.next();

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
  // Signed-out visitors go straight to the login (UX only; the role check stays in pages and actions).
  if (!user && pathname !== "/admin/prihlasenie") {
    return NextResponse.redirect(new URL("/admin/prihlasenie", request.url));
  }
  return response;
}

// Storefront pages stay proxy-free (no extra hop); "/" catches the admin host's root.
export const config = {
  matcher: ["/", "/admin/:path*"],
};
