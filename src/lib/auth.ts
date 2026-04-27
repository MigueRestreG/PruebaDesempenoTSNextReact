import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { randomUUID } from "node:crypto";
import {
  ACCESS_TOKEN_EXPIRATION,
  IS_PRODUCTION,
  REFRESH_TOKEN_EXPIRATION,
} from "@/src/lib/constants";
import type { AuthTokenPayload, User } from "@/src/types";

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }
  return encoder.encode(secret);
}

export async function signAccessToken(user: User) {
  return new SignJWT({
    email: user.email,
    username: user.username,
    nombre: user.nombre,
    role: user.role,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(getJwtSecret());
}

export async function signRefreshToken(user: User, tokenId: string) {
  return new SignJWT({
    email: user.email,
    username: user.username,
    nombre: user.nombre,
    role: user.role,
    type: "refresh",
    jti: tokenId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
    .sign(getJwtSecret());
}

function mapPayload(payload: JWTPayload): AuthTokenPayload | null {
  const role = payload.role;
  const type = payload.type;

  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.username !== "string" ||
    typeof payload.nombre !== "string" ||
    (role !== "admin" && role !== "usuario") ||
    (type !== "access" && type !== "refresh")
  ) {
    return null;
  }

  return {
    sub: payload.sub,
    email: payload.email,
    username: payload.username,
    nombre: payload.nombre,
    role,
    type,
    jti: typeof payload.jti === "string" ? payload.jti : undefined,
  };
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return mapPayload(verified.payload);
  } catch {
    return null;
  }
}

export function newTokenId() {
  return randomUUID();
}

export function buildCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
