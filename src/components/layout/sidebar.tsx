"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/src/types";

type SidebarProps = {
  nombre: string;
  role: UserRole;
};

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/buses", label: "Buses" },
  { href: "/conductores", label: "Conductores" },
];

export function Sidebar({ nombre, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-full lg:w-72 lg:min-h-screen border-r border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-200">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Panel
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Flota y Conductores
        </h1>
      </div>

      <div className="p-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-4 text-white shadow-lg">
          <p className="text-xs uppercase tracking-wider text-cyan-100">
            Sesion activa
          </p>
          <p className="mt-1 text-lg font-medium">{nombre}</p>
          <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {role}
          </span>
        </div>

        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-8 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
