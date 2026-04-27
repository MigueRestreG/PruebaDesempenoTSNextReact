"use client";

import { FormEvent, useState, useEffect } from "react";
import type { Bus, Driver, UserRole } from "@/src/types";

type Asignacion = {
  id: string;
  conductorId: string;
  busId: string;
  conductor: Driver;
  bus: Bus;
};

type AsignacionesManagerProps = {
  role: UserRole;
};

export function AsignacionesManager({ role }: AsignacionesManagerProps) {
  const [items, setItems] = useState<Asignacion[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [conductores, setConductores] = useState<Driver[]>([]);
  
  const [form, setForm] = useState({ busId: "", conductorId: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isReadonly = role === "usuario";

  // Funcion centralizada para cargar todos los datos necesarios
  // Se ejecutan las 3 promesas en paralelo para mayor rapidez
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [asignacionesRes, busesRes, conductoresRes] = await Promise.all([
        fetch("/api/asignaciones"),
        fetch("/api/buses"),
        fetch("/api/conductores"),
      ]);

      if (!asignacionesRes.ok || !busesRes.ok || !conductoresRes.ok) {
        throw new Error("Error al cargar datos");
      }

      const asignacionesData = await asignacionesRes.json();
      const busesData = await busesRes.json();
      const conductoresData = await conductoresRes.json();

      setItems(asignacionesData.data || []);
      setBuses(busesData.data || []);
      setConductores(conductoresData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Envio de datos para crear la relacion 1:1
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.busId || !form.conductorId) {
      setError("Debes seleccionar un bus y un conductor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Error al crear la asignación");
      }

      setForm({ busId: "", conductorId: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/asignaciones/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar la asignación");
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Gestion
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">Asignaciones</h2>
      </header>

      {error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {/* Control de roles: Si el usuario es de solo lectura, no renderizamos el formulario */}
      {!isReadonly ? (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <select
              value={form.conductorId}
              onChange={(e) => setForm({ ...form, conductorId: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3"
              required
            >
              <option value="">Selecciona un Conductor</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.licencia})
                </option>
              ))}
            </select>

            <select
              value={form.busId}
              onChange={(e) => setForm({ ...form, busId: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-3"
              required
            >
              <option value="">Selecciona un Bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.placa} - {b.modelo}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Asignar Bus a Conductor
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Tu rol solo permite lectura.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Conductor</th>
              <th className="px-4 py-3 font-semibold">Bus</th>
              {!isReadonly ? (
                <th className="px-4 py-3 font-semibold">Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={3}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={3}>
                  No hay asignaciones registradas.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.conductor?.nombre} <span className="text-xs text-slate-500">({item.conductor?.licencia})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      Placa: {item.bus?.placa}
                    </span>
                  </td>
                  {!isReadonly ? (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void remove(item.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                      >
                        Eliminar Unión
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
