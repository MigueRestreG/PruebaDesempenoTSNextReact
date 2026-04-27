import { DriversManager } from "@/src/components/drivers/drivers-manager";
import { requirePageUser } from "@/src/lib/page-auth";
import { listBuses, listDrivers } from "@/src/lib/repositories";

export default async function ConductoresPage() {
  const user = await requirePageUser();
  const [driversResult, busesResult] = await Promise.all([
    listDrivers(),
    listBuses(),
  ]);

  return (
    <DriversManager
      role={user.role}
      initialDrivers={driversResult.data}
      initialBuses={busesResult.data}
    />
  );
}
