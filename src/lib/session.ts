import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/src/lib/constants";
import { fail } from "@/src/lib/http";
import { verifyToken } from "@/src/lib/auth";
import type { AuthTokenPayload, UserRole } from "@/src/types";

/**
 * Extrae el token del header Authorization o de la cookie.
 */
export async function getTokenFromRequest(request: NextRequest | Request) {
  const authorization =
    request instanceof NextRequest
      ? request.headers.get("authorization")
      : request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "").trim();
  }

  if (request instanceof NextRequest) {
    return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  }

  // Fallback: parsear cookie manualmente desde el header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith(`${ACCESS_TOKEN_COOKIE}=`));
    if (match) {
      return match.split("=").slice(1).join("=").trim();
    }
  }

  return null;
}

/**
 * Extrae y valida el usuario desde el request (API routes).
 */
export async function getCurrentUserFromRequest(
  request: NextRequest | Request,
) {
  const token = await getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") {
    return null;
  }

  return payload;
}

/**
 * Extrae el usuario desde cookies (Server Components).
 */
export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") {
    return null;
  }

  return payload;
}

/**
 * Verifica si el usuario tiene rol admin.
 */
export function isAdmin(user: AuthTokenPayload) {
  return user.role === "admin";
}

/**
 * Verifica si el usuario tiene alguno de los roles permitidos.
 */
export function hasRole(user: AuthTokenPayload, roles: UserRole[]) {
  return roles.includes(user.role);
}

/**
 * Middleware de autenticación para API routes.
 * Retorna el usuario o una respuesta de error 401/403.
 */
export async function requireUser(
  request: NextRequest | Request,
  allowedRoles?: UserRole[],
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return { user: null as null, error: fail("No autenticado", 401) };
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return { user: null as null, error: fail("No autorizado", 403) };
  }

  return { user, error: null as null };
}
