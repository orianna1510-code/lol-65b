import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-bold tracking-tight">
            <span className="text-mint">LOL</span>
            <span className="text-zinc-500">-</span>
            <span className="text-lavender">65B</span>
          </h1>
          <p className="mt-1 font-mono text-xs tracking-widest text-zinc-500 uppercase">
            The Latent Space Lounge
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface/50 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
