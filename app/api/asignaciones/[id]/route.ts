import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { requireUser, isAdmin } from "@/src/lib/session";
import { logAudit } from "@/src/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    if (!isAdmin(user!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const asignacionId = id;

    const asignacion = await prisma.asignacion.findUnique({
      where: { id: asignacionId },
      include: { bus: true, conductor: true }
    });

    if (!asignacion) {
      return NextResponse.json(
        { error: "Asignacion no encontrada" },
        { status: 404 },
      );
    }

    await prisma.asignacion.delete({ where: { id: asignacionId } });

    await logAudit({
      userId: String(user.sub),
      username: user.username,
      action: "DELETE",
      entity: "Asignacion",
      entityId: String(asignacionId),
      details: `Asignación eliminada: Bus ${asignacion.bus.placa} - Conductor ${asignacion.conductor.nombre}`,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/asignaciones error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
