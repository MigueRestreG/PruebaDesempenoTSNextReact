import { NextResponse } from "next/server";

export function fail(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status },
  );
}
