import { NextResponse } from "next/server";
import { busSchema, paginationSchema } from "@/src/lib/schemas";
import { requireUser, isAdmin } from "@/src/lib/session";
import { listBuses, createBus, getBusByPlate } from "@/src/lib/repositories";
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
      isActive: searchParams.get("isActive") || undefined,
    };

    const parsedParams = paginationSchema.safeParse(params);
    const validParams = parsedParams.success ? parsedParams.data : undefined;

    const result = await listBuses(validParams);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/buses error:", error);
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
    const result = busSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existing = await getBusByPlate(result.data.placa);
    if (existing) {
      return NextResponse.json(
        { error: "Bus plate already exists" },
        { status: 409 },
      );
    }

    const bus = await createBus({
      placa: result.data.placa,
      modelo: result.data.modelo,
      capacidad: result.data.capacidad,
      descripcion: result.data.descripcion,
      tarifa: result.data.tarifa,
      isActive: result.data.isActive,
    });

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "CREATE",
      entity: "Bus",
      entityId: String(bus.id),
      details: `Bus creado: ${bus.placa}`,
    });

    return NextResponse.json(bus, { status: 201 });
  } catch (error) {
    console.error("POST /api/buses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
