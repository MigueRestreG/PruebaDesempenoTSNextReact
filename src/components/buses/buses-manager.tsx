"use client";

import { FormEvent, useMemo, useState } from "react";
import { StatusBadge } from "@/src/components/ui/status-badge";
import type { Bus, UserRole } from "@/src/types";

type BusesManagerProps = {
  role: UserRole;
  initialBuses: Bus[];
};

const initialForm = {
  placa: "",
  modelo: "",
  capacidad: 0,
  descripcion: "",
  tarifa: 0,
  isActive: "true",
};

export function BusesManager({ role, initialBuses }: BusesManagerProps) {
  const [items, setItems] = useState<Bus[]>(initialBuses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isReadonly = role === "usuario";

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buses");
      if (!response.ok) {
        throw new Error("No fue posible cargar buses");
      }
      const payload = (await response.json()) as { data: Bus[] };
      setItems(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: Bus) {
    setEditingId(item.id);
    setForm({
      placa: item.placa,
      modelo: item.modelo,
      capacidad: item.capacidad,
      descripcion: item.descripcion || "",
      tarifa: Number(item.tarifa),
      isActive: item.isActive ? "true" : "false",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/buses/${editingId}` : "/api/buses",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            isActive: form.isActive === "true",
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as any;
        if (payload?.details) {
          const firstError = Object.values(payload.details)[0] as string[];
          throw new Error(firstError[0]);
        }
        throw new Error(payload?.error ?? "No se pudo guardar");
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/buses/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "No se pudo eliminar");
      }
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  const activeCount = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Gestion
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">Buses</h2>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge value={`Total: ${items.length}`} variant="neutral" />
          <StatusBadge value={`Activos: ${activeCount}`} variant="success" />
        </div>
      </header>

      {error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      {!isReadonly ? (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5"
        >
          <input
            placeholder="Placa"
            value={form.placa}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, placa: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            placeholder="Modelo"
            value={form.modelo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, modelo: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            type="number"
            placeholder="Capacidad"
            value={form.capacidad}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                capacidad: Number(event.target.value || 0),
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            type="number"
            placeholder="Tarifa (precio)"
            value={form.tarifa || ""}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                tarifa: Number(event.target.value || 0),
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                descripcion: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
          />
          <select
            value={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                isActive: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              {editingId ? "Actualizar" : "Crear"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                Cancelar
              </button>
            ) : null}
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
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Capacidad</th>
              <th className="px-4 py-3 font-semibold">Tarifa</th>
              <th className="px-4 py-3 font-semibold">Desc.</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              {!isReadonly ? (
                <th className="px-4 py-3 font-semibold">Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={7}>
                  No hay buses registrados.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.placa}
                  </td>
                  <td className="px-4 py-3">{item.modelo}</td>
                  <td className="px-4 py-3">{item.capacidad}</td>
                  <td className="px-4 py-3">${item.tarifa}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate" title={item.descripcion || ""}>{item.descripcion || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {item.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {!isReadonly ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
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
