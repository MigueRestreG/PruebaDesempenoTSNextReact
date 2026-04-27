"use client";

import { FormEvent, useState } from "react";
import type { Driver, UserRole } from "@/src/types";

type DriversManagerProps = {
  role: UserRole;
  initialDrivers: Driver[];
};

const initialForm = {
  nombre: "",
  licencia: "",
  telefono: "",
};

export function DriversManager({
  role,
  initialDrivers,
}: DriversManagerProps) {
  const [items, setItems] = useState<Driver[]>(initialDrivers);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isReadonly = role === "usuario";

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conductores");

      if (!response.ok) {
        throw new Error("No fue posible cargar los datos");
      }

      const payload = (await response.json()) as { data: Driver[] };
      setItems(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: Driver) {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      licencia: item.licencia,
      telefono: item.telefono,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      ...form,
    };

    try {
      const response = await fetch(
        editingId ? `/api/conductores/${editingId}` : "/api/conductores",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form }),
        },
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "No se pudo guardar");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/conductores/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "No se pudo eliminar");
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
        <h2 className="text-3xl font-semibold text-slate-900">Conductores</h2>
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
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            placeholder="Nombre"
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            value={form.licencia}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, licencia: event.target.value }))
            }
            placeholder="Licencia"
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <input
            value={form.telefono}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, telefono: event.target.value }))
            }
            placeholder="Telefono"
            className="rounded-xl border border-slate-300 px-4 py-3"
            required
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              type="submit"
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
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Licencia</th>
              <th className="px-4 py-3 font-semibold">Telefono</th>
              {!isReadonly ? (
                <th className="px-4 py-3 font-semibold">Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No hay conductores registrados.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.nombre}
                  </td>
                  <td className="px-4 py-3">{item.licencia}</td>
                  <td className="px-4 py-3">{item.telefono}</td>
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
