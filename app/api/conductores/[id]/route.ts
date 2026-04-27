import { NextResponse } from "next/server";
import { driverSchema } from "@/src/lib/schemas";
import { requireUser, isAdmin } from "@/src/lib/session";
import {
  updateDriver,
  deleteDriver,
  getDriverById,
  busHasAssignedDriver,
} from "@/src/lib/repositories";
import { logAudit } from "@/src/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const driverId = id;

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

    const currentDriver = await getDriverById(driverId);
    if (!currentDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (result.data.busId && result.data.busId !== currentDriver.busId) {
      const hasDriver = await busHasAssignedDriver(result.data.busId);
      if (hasDriver) {
        return NextResponse.json(
          { error: "Bus already has an assigned driver" },
          { status: 409 },
        );
      }
    }

    const updated = await updateDriver(driverId, {
      nombre: result.data.nombre,
      licencia: result.data.licencia,
      telefono: result.data.telefono,
      busId: result.data.busId ?? null,
    });

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "UPDATE",
      entity: "Conductor",
      entityId: String(driverId),
      details: `Conductor actualizado: ${updated.nombre}`,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/conductores/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const driverId = id;

    const currentDriver = await getDriverById(driverId);
    if (!currentDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    await deleteDriver(driverId);

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "DELETE",
      entity: "Conductor",
      entityId: String(driverId),
      details: `Conductor eliminado: ${currentDriver.nombre}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/conductores/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
