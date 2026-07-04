"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Lock, Car } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || "Login failed. Please try again.");
        return;
      }

      const from = searchParams.get("from") || "/admin";
      router.push(from);
      //router.refresh();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-brass-400/40 text-brass-400">
            <Car className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-[0.2em] text-ink">
            {process.env.NEXT_PUBLIC_SITE_NAME || "Prestige Motors"}
          </h1>
          <p className="mt-1 text-sm text-muted">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-surface space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-brass-400">
            <Lock className="h-4 w-4" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">
              Restricted Access
            </h2>
          </div>

          <div>
            <label htmlFor="email" className="label-field">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="input-field"
              placeholder="admin@example.com"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label-field">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{serverError}</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          This area is restricted to dealership administrators only.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
