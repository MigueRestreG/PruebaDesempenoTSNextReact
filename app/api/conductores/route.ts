import { NextResponse } from "next/server";
import { driverSchema, paginationSchema } from "@/src/lib/schemas";
import { requireUser, isAdmin } from "@/src/lib/session";
import {
  listDrivers,
  createDriver,
} from "@/src/lib/repositories";
import { logAudit } from "@/src/lib/audit";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      search: searchParams.get("search") || undefined,
    };

    const parsedParams = paginationSchema.safeParse(params);
    const validParams = parsedParams.success ? parsedParams.data : undefined;

    const result = await listDrivers(validParams);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/conductores error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const result = driverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const driver = await createDriver({
      nombre: result.data.nombre,
      licencia: result.data.licencia,
      telefono: result.data.telefono,
    });

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "CREATE",
      entity: "Conductor",
      entityId: String(driver.id),
      details: `Conductor creado: ${driver.nombre}`,
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("POST /api/conductores error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
