import { AppShell } from "@/src/components/layout/app-shell";
import { requirePageUser } from "@/src/lib/page-auth";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Gestión de Flota",
  description: "Panel de control para la administración de buses y conductores en tiempo real.",
};

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requirePageUser();

  return (
    <AppShell nombre={user.nombre} role={user.role}>
      {children}
    </AppShell>
  );
}
