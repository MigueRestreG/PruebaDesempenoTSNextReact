import { prisma } from "@/src/lib/db";

/**
 * Registra una entrada de auditoría para operaciones CRUD y auth.
 */
export async function logAudit(input: {
  userId?: string;
  username?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({ data: input });
  } catch (error) {
    console.error("[AUDIT] Error registrando log:", error);
  }
}
