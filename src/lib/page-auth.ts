import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/src/lib/session";

export async function requirePageUser() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    redirect("/login");
  }

  return user;
}
