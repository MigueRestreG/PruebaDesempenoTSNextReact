"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las claves no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, username, password, confirmPassword }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          payload?.error ?? "No fue posible completar el registro",
        );
      }

      await router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,_#bae6fd,_transparent_45%),radial-gradient(circle_at_80%_80%,_#bfdbfe,_transparent_40%),linear-gradient(135deg,#f8fafc,#f1f5f9)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl backdrop-blur-xl">
        <section className="hidden w-1/2 flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Registro
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Unete al sistema de gestion de flota
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-slate-300">
              Crea tu cuenta para acceder al panel de gestion. Podras consultar
              buses, conductores y el estado de la flota en tiempo real.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                1
              </span>
              <span>Completa el formulario</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                2
              </span>
              <span>Accede al dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                3
              </span>
              <span>Gestiona la flota</span>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-12">
          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Nuevo usuario
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Crear cuenta
              </h2>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Nombre completo
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej: Miguel Angel Restrepo"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </span>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Ej: miguel@ejemplo.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Usuario
              </span>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ej: miguelangel"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Clave
              </span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimo 6 caracteres"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar clave
              </span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la clave"
                required
              />
            </label>

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-cyan-600 transition hover:text-cyan-700"
              >
                Inicia sesion
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
