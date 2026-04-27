import { BusesManager } from "@/src/components/buses/buses-manager";
import { requirePageUser } from "@/src/lib/page-auth";
import { listBuses } from "@/src/lib/repositories";

export default async function BusesPage() {
  const user = await requirePageUser();
  const busesResult = await listBuses();
  return <BusesManager role={user.role} initialBuses={busesResult.data} />;
}
