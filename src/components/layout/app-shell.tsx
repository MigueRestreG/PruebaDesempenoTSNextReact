import type { ReactNode } from "react";
import type { UserRole } from "@/src/types";
import { Sidebar } from "@/src/components/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
  nombre: string;
  role: UserRole;
};

export function AppShell({ children, nombre, role }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_40%,_#ffffff_75%)]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <Sidebar nombre={nombre} role={role} />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
