import { NextResponse } from "next/server";
import {
  buildCookieOptions,
  newTokenId,
  signAccessToken,
  signRefreshToken,
} from "@/src/lib/auth";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/src/lib/constants";
import { fail } from "@/src/lib/http";
import { loginSchema } from "@/src/lib/schemas";
import {
  checkPassword,
  clearExpiredRefreshTokens,
  getUserByEmail,
  storeRefreshToken,
} from "@/src/lib/repositories";
import { logAudit } from "@/src/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Credenciales invalidas", 400, parsed.error.flatten());
    }

    const userRecord = await getUserByEmail(parsed.data.email);

    if (
      !userRecord ||
      !checkPassword(parsed.data.password, userRecord.passwordHash)
    ) {
      await logAudit({
        action: "LOGIN_FAILED",
        entity: "User",
        details: `Intento fallido para email: ${parsed.data.email}`,
      });
      return fail("Usuario o clave incorrectos", 401);
    }

    // Fire and forget
    clearExpiredRefreshTokens().catch(console.error);

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
      nombre: userRecord.nombre,
      role: userRecord.role,
    };

    const tokenId = newTokenId();
    const accessToken = await signAccessToken(user);
    const refreshToken = await signRefreshToken(user, tokenId);
    const refreshExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await storeRefreshToken(tokenId, user.id, refreshExpiry);

    await logAudit({
      userId: String(user.id),
      username: user.username,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: String(user.id),
    });

    const response = NextResponse.json(
      {
        user,
        accessToken,
        refreshToken,
      },
      { status: 200 },
    );

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      buildCookieOptions(15 * 60),
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      buildCookieOptions(7 * 24 * 60 * 60),
    );

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return fail("Error interno del servidor", 500);
  }
}
