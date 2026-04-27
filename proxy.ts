import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/src/lib/constants";
import { verifyToken } from "@/src/lib/auth";

const PUBLIC_PAGE_PATHS = ["/login", "/register"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/refresh", "/api/auth/register"];

function isProtectedPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/buses") ||
    pathname.startsWith("/conductores")
  );
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api");
}

function isPublicPage(pathname: string) {
  return PUBLIC_PAGE_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.some((path) => pathname.startsWith(path));
}

function unauthorizedApiResponse() {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}

function forbiddenApiResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (isPublicPage(pathname) && payload?.type === "access") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isApiPath(pathname)) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!payload || payload.type !== "access") {
      return unauthorizedApiResponse();
    }

    const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(
      request.method,
    );
    const isCrudPath =
      pathname.startsWith("/api/buses") || pathname.startsWith("/api/conductores");

    if (payload.role === "usuario" && isMutatingMethod && isCrudPath) {
      return forbiddenApiResponse();
    }

    return NextResponse.next();
  }

  if (isProtectedPage(pathname) && (!payload || payload.type !== "access")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/buses/:path*",
    "/conductores/:path*",
    "/api/:path*",
  ],
};
