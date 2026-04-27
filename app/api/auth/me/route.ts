import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/session";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET /me error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
