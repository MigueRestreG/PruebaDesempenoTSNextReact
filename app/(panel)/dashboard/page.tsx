import { DashboardView } from "@/src/components/dashboard/dashboard-view";
import { requirePageUser } from "@/src/lib/page-auth";
import {
  listBuses,
  listDrivers,
  getDashboardCounters,
} from "@/src/lib/repositories";

export default async function DashboardPage() {
  const user = await requirePageUser();

  const [counters, busesResult, driversResult] = await Promise.all([
    getDashboardCounters(),
    listBuses({ limit: 5 }),
    listDrivers({ limit: 5 }),
  ]);

  const initialData = {
    counters,
    buses: busesResult.data,
    conductores: driversResult.data,
  };

  return <DashboardView nombre={user.nombre} data={initialData} />;
}
