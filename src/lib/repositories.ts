import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/db";

// ─── Buses ──────────────────────────────────────────────

export async function listBuses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params?.isActive !== undefined) {
    where.isActive = params.isActive === "true";
  }

  if (params?.search) {
    where.OR = [
      { placa: { contains: params.search, mode: "insensitive" } },
      { modelo: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.bus.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: limit,
    }),
    prisma.bus.count({ where }),
  ]);

  return {
    data: data.map((b) => ({ ...b, tarifa: Number(b.tarifa) })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBusById(id: string) {
  const bus = await prisma.bus.findUnique({ where: { id } });
  return bus ? { ...bus, tarifa: Number(bus.tarifa) } : null;
}

export async function getBusByPlate(placa: string) {
  return prisma.bus.findUnique({ where: { placa } });
}

export async function createBus(input: {
  placa: string;
  modelo: string;
  capacidad: number;
  descripcion?: string | null;
  tarifa: number;
  isActive: boolean;
}) {
  return prisma.bus.create({ data: input });
}

export async function updateBus(
  id: string,
  input: {
    placa: string;
    modelo: string;
    capacidad: number;
    descripcion?: string | null;
    tarifa: number;
    isActive: boolean;
  },
) {
  return prisma.bus.update({ where: { id }, data: input });
}

export async function deleteBus(id: string) {
  return prisma.bus.delete({ where: { id } });
}

// ─── Conductores ────────────────────────────────────────

export async function listDrivers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params?.search) {
    where.OR = [
      { nombre: { contains: params.search, mode: "insensitive" } },
      { licencia: { contains: params.search, mode: "insensitive" } },
      { telefono: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.conductor.findMany({
      where,
      include: { asignacion: { include: { bus: { select: { id: true, placa: true } } } } },
      orderBy: { id: "desc" },
      skip,
      take: limit,
    }),
    prisma.conductor.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDriverById(id: string) {
  return prisma.conductor.findUnique({
    where: { id },
    include: { asignacion: { include: { bus: { select: { id: true, placa: true } } } } },
  });
}

export async function createDriver(input: {
  nombre: string;
  licencia: string;
  telefono: string;
}) {
  return prisma.conductor.create({
    data: input,
    include: { asignacion: { include: { bus: { select: { id: true, placa: true } } } } },
  });
}

export async function updateDriver(
  id: string,
  input: {
    nombre: string;
    licencia: string;
    telefono: string;
  },
) {
  return prisma.conductor.update({
    where: { id },
    data: input,
    include: { asignacion: { include: { bus: { select: { id: true, placa: true } } } } },
  });
}

export async function deleteDriver(id: string) {
  return prisma.conductor.delete({ where: { id } });
}

export async function busHasAssignedDriver(busId: string) {
  const count = await prisma.asignacion.count({ where: { busId } });
  return count > 0;
}

// ─── Usuarios ───────────────────────────────────────────

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export function checkPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export async function createUser(input: {
  email: string;
  username: string;
  nombre: string;
  password: string;
  role: string;
}) {
  const passwordHash = bcrypt.hashSync(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      nombre: input.nombre,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      username: true,
      nombre: true,
      role: true,
    },
  });
  return user;
}

// ─── Refresh Tokens ─────────────────────────────────────

export async function storeRefreshToken(
  tokenId: string,
  userId: string,
  expiresAt: string,
) {
  await prisma.refreshToken.create({
    data: { id: tokenId, userId, expiresAt: new Date(expiresAt) },
  });
}

export async function getRefreshToken(tokenId: string) {
  return prisma.refreshToken.findUnique({ where: { id: tokenId } });
}

export async function deleteRefreshToken(tokenId: string) {
  await prisma.refreshToken.deleteMany({ where: { id: tokenId } });
}

export async function clearExpiredRefreshTokens() {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

// ─── Dashboard ──────────────────────────────────────────

export async function getDashboardCounters() {
  const [busesActivos, busesInactivos, conductoresDisponibles, conductoresAsignados] =
    await Promise.all([
      prisma.bus.count({ where: { isActive: true } }),
      prisma.bus.count({ where: { isActive: false } }),
      prisma.conductor.count({ where: { asignacion: null } }),
      prisma.conductor.count({ where: { asignacion: { isNot: null } } }),
    ]);

  return {
    busesActivos,
    busesInactivos,
    conductoresDisponibles,
    conductoresAsignados,
  };
}
