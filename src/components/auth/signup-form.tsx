"use client";

import { useState } from "react";
import Link from "next/link";
import { signupSchema } from "@/lib/validations/auth";
import { signup } from "@/app/(auth)/actions";

export function SignupForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    const result = signupSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    const response = await signup(formData);
    if (response?.error) {
      setServerError(response.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-error">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="username"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="cool-human-42"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-error">{errors.username}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="8+ characters"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-error">{errors.password}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-2 text-sm text-error">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-mint px-6 py-3 font-mono text-sm font-semibold text-black transition-all hover:bg-mint-dim hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-lavender hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
