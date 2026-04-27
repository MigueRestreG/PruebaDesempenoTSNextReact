import { NextResponse } from "next/server";
import {
  verifyToken,
  signAccessToken,
  signRefreshToken,
  buildCookieOptions,
  newTokenId,
} from "@/src/lib/auth";
import {
  getRefreshToken,
  storeRefreshToken,
  deleteRefreshToken,
} from "@/src/lib/repositories";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/src/lib/constants";
import { fail } from "@/src/lib/http";
import { logAudit } from "@/src/lib/audit";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let refreshToken: string | undefined;

    if (cookieHeader) {
      refreshToken = cookieHeader
        .split(";")
        .find((item) => item.trim().startsWith(`${REFRESH_TOKEN_COOKIE}=`))
        ?.split("=")[1]
        ?.trim();
    }

    if (!refreshToken) {
      return fail("Refresh token no encontrado", 401);
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh" || !payload.jti) {
      return fail("Refresh token invalido", 401);
    }

    const storedToken = await getRefreshToken(payload.jti);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return fail("Refresh token expirado", 401);
    }

    // Delete old refresh token to prevent reuse (Rotation)
    await deleteRefreshToken(payload.jti);

    const user = {
      id: String(payload.sub),
      email: payload.email,
      username: payload.username,
      nombre: payload.nombre,
      role: payload.role,
    };

    // Create new tokens
    const newTokenIdValue = newTokenId();
    const newAccessToken = await signAccessToken(user);
    const newRefreshToken = await signRefreshToken(user, newTokenIdValue);

    // Store new refresh token
    const refreshExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    await storeRefreshToken(newTokenIdValue, user.id, refreshExpiry);

    await logAudit({
      userId: String(user.id),
      username: user.username,
      action: "TOKEN_REFRESH",
      entity: "Auth",
    });

    const response = NextResponse.json(
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      { status: 200 },
    );

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      newAccessToken,
      buildCookieOptions(15 * 60),
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      newRefreshToken,
      buildCookieOptions(7 * 24 * 60 * 60),
    );

    return response;
  } catch (error) {
    console.error("POST /api/auth/refresh error:", error);
    return fail("Error interno del servidor", 500);
  }
}
