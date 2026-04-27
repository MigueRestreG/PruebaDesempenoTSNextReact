import { NextResponse } from "next/server";
import {
  buildCookieOptions,
  newTokenId,
  signAccessToken,
  signRefreshToken,
} from "@/src/lib/auth";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/src/lib/constants";
import { fail } from "@/src/lib/http";
import { registerSchema } from "@/src/lib/schemas";
import {
  getUserByUsername,
  getUserByEmail,
  createUser,
  storeRefreshToken,
} from "@/src/lib/repositories";
import { logAudit } from "@/src/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Datos de registro invalidos", 400, parsed.error.flatten());
    }

    const [existingUser, existingEmail] = await Promise.all([
      getUserByUsername(parsed.data.username),
      getUserByEmail(parsed.data.email),
    ]);

    if (existingUser) {
      return fail("El nombre de usuario ya esta registrado", 409);
    }

    if (existingEmail) {
      return fail("El email ya esta registrado", 409);
    }

    const user = await createUser({
      email: parsed.data.email,
      username: parsed.data.username,
      nombre: parsed.data.nombre,
      password: parsed.data.password,
      role: "usuario",
    });

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
      action: "REGISTER_SUCCESS",
      entity: "User",
      entityId: String(user.id),
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          nombre: user.nombre,
          role: user.role,
        },
      },
      { status: 201 },
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
    console.error("POST /api/auth/register error:", error);
    return fail("Error interno del servidor", 500);
  }
}
