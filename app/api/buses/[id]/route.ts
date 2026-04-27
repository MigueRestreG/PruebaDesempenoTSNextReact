import { NextResponse } from "next/server";
import { busSchema } from "@/src/lib/schemas";
import { requireUser, isAdmin } from "@/src/lib/session";
import {
  updateBus,
  deleteBus,
  busHasAssignedDriver,
  getBusById,
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
    const busId = id;

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

    const existingBus = await getBusById(busId);
    if (!existingBus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    const updated = await updateBus(busId, {
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
      action: "UPDATE",
      entity: "Bus",
      entityId: String(busId),
      details: `Bus actualizado: ${updated.placa}`,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/buses/[id] error:", error);
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
    const busId = id;

    const hasDriver = await busHasAssignedDriver(busId);
    if (hasDriver) {
      return NextResponse.json(
        { error: "Cannot delete bus with assigned driver" },
        { status: 409 },
      );
    }

    const existingBus = await getBusById(busId);
    if (!existingBus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    await deleteBus(busId);

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "DELETE",
      entity: "Bus",
      entityId: String(busId),
      details: `Bus eliminado: ${existingBus.placa}`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/buses/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
