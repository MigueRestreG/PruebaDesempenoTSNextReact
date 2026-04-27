import { AsignacionesManager } from "@/src/components/asignaciones/asignaciones-manager";
import { requirePageUser } from "@/src/lib/page-auth";

export default async function AsignacionesPage() {
  const user = await requirePageUser();

  return (
    <AsignacionesManager role={user.role} />
  );
}
