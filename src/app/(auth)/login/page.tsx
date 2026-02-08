import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login — LOL-65B",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-center font-mono text-lg font-semibold text-zinc-100">
        Welcome Back
      </h2>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-lg bg-surface" />
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
