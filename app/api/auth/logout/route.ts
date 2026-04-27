import { NextResponse } from "next/server";
import { verifyToken } from "@/src/lib/auth";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  IS_PRODUCTION,
} from "@/src/lib/constants";
import { deleteRefreshToken } from "@/src/lib/repositories";

const expiredCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: IS_PRODUCTION,
  path: "/",
  maxAge: 0,
};

export async function POST(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .find((item) => item.trim().startsWith(`${REFRESH_TOKEN_COOKIE}=`))
    ?.split("=")[1];

  if (token) {
    const payload = await verifyToken(token);
    if (payload?.jti) {
      deleteRefreshToken(payload.jti);
    }
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", expiredCookie);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", expiredCookie);

  return response;
}
