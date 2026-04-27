"use client";

import { useMemo } from "react";
import { StatusBadge } from "@/src/components/ui/status-badge";
import type { Bus, DriverWithBus } from "@/src/types";

type DashboardPayload = {
  counters: {
    busesActivos: number;
    busesInactivos: number;
    conductoresDisponibles: number;
    conductoresAsignados: number;
  };
  buses: Bus[];
  conductores: DriverWithBus[];
};

type DashboardViewProps = {
  nombre: string;
  data: DashboardPayload;
};

export function DashboardView({ nombre, data }: DashboardViewProps) {
  const activeBuses = useMemo(
    () => data?.buses.filter((bus) => bus.isActive) ?? [],
    [data],
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Resumen diario
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">
          Hola, {nombre}
        </h2>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
          <p className="text-sm text-emerald-700">Buses activos</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">
            {data.counters.busesActivos}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">Buses inactivos</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {data.counters.busesInactivos}
          </p>
        </article>
        <article className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5">
          <p className="text-sm text-cyan-700">Conductores disponibles</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-900">
            {data.counters.conductoresDisponibles}
          </p>
        </article>
        <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
          <p className="text-sm text-blue-700">Conductores asignados</p>
          <p className="mt-2 text-3xl font-semibold text-blue-900">
            {data.counters.conductoresAsignados}
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Buses activos
            </h3>
            <StatusBadge value={`${activeBuses.length}`} variant="success" />
          </div>
          <div className="space-y-3">
            {activeBuses.length === 0 ? (
              <p className="text-sm text-slate-500">No hay buses activos.</p>
            ) : (
              activeBuses.slice(0, 6).map((bus) => (
                <div
                  key={bus.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{bus.placa}</p>
                    <p className="text-sm text-slate-500">{bus.modelo}</p>
                  </div>
                  <StatusBadge value="Activo" variant="success" />
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Conductores disponibles
            </h3>
            <StatusBadge
              value={`${data.counters.conductoresDisponibles}`}
              variant="warning"
            />
          </div>
          <div className="space-y-3">
            {data.conductores.filter((item) => !item.busId).length === 0 ? (
              <p className="text-sm text-slate-500">
                Todos los conductores tienen bus asignado.
              </p>
            ) : (
              data.conductores
                .filter((item) => !item.busId)
                .slice(0, 6)
                .map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {driver.nombre}
                      </p>
                      <p className="text-sm text-slate-500">
                        Licencia: {driver.licencia}
                      </p>
                    </div>
                    <StatusBadge value="Disponible" variant="warning" />
                  </div>
                ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
