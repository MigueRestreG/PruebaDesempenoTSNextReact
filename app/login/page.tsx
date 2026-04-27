"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "No fue posible iniciar sesion");
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
              Sistema
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Gestion inteligente de flota
            </h1>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Ingresa el correo que usaste al registrarte.</p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-12">
          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Acceso
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Bienvenido
              </h2>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </span>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cyan-200 transition focus:ring-4"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {loading ? "Ingresando..." : "Entrar"}
            </button>

            <p className="text-center text-sm text-slate-500">
              No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-semibold text-cyan-600 transition hover:text-cyan-700"
              >
                Crear cuenta
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
