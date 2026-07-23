import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { PAGE_ROUTES, PUBLIC_ROUTES } from "@/shared/constants/routes";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const refreshToken = request.cookies.get("refresh_token")?.value;
  const accessToken = request.cookies.get("access_token")?.value;

  if (isPublicRoute) {
    if (pathname === PAGE_ROUTES.LOGIN && (refreshToken || accessToken)) {
      // Do not redirect to dashboard if user arrived with a redirect parameter (indicating an auth failure/logout)
      if (!searchParams.has("redirect") && accessToken) {
        return NextResponse.redirect(new URL(PAGE_ROUTES.DASHBOARD, request.url));
      }
    }
    return NextResponse.next();
  }

  if (!refreshToken && !accessToken) {
    const loginUrl = new URL(PAGE_ROUTES.LOGIN, request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
