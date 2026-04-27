import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { requireUser, isAdmin } from "@/src/lib/session";
import { logAudit } from "@/src/lib/audit";
import { z } from "zod";

const asignacionSchema = z.object({
  conductorId: z.string().uuid("ID de conductor inválido"),
  busId: z.string().uuid("ID de bus inválido"),
});

export async function GET(request: Request) {
  try {
    // Verificacion de sesion usando el middleware unificado
    const { user, error } = await requireUser(request);
    if (error) return error;

    // Query de asignaciones con cruce de datos (JOIN) hacia Conductor y Bus
    // Esto es necesario para devolver los nombres y placas al frontend
    const data = await prisma.asignacion.findMany({
      include: {
        conductor: true,
        bus: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("GET /api/asignaciones error:", error);
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

    if (!isAdmin(user!)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const result = asignacionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Regla de Negocio: Relacion 1 a 1 entre Conductor y Bus
    // Si el conductor ya tenia un bus, o el bus ya tenia un conductor,
    // se elimina la asignacion previa antes de crear la nueva (reasignacion automatica).
    await prisma.asignacion.deleteMany({
      where: {
        OR: [
          { busId: result.data.busId },
          { conductorId: result.data.conductorId },
        ],
      },
    });

    const asignacion = await prisma.asignacion.create({
      data: {
        conductorId: result.data.conductorId,
        busId: result.data.busId,
      },
      include: {
        conductor: true,
        bus: true,
      },
    });

    await logAudit({
      userId: String(user!.sub),
      username: user!.username,
      action: "CREATE",
      entity: "Asignacion",
      entityId: String(asignacion.id),
      details: `Asignado Bus ${asignacion.bus.placa} a Conductor ${asignacion.conductor.nombre}`,
    });

    return NextResponse.json(asignacion, { status: 201 });
  } catch (error) {
    console.error("POST /api/asignaciones error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
