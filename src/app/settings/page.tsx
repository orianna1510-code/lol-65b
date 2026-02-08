import { requireAuth } from "@/lib/auth";
import { SettingsForm } from "@/components/auth/settings-form";

export const metadata = {
  title: "Settings — LOL-65B",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 font-mono text-2xl font-bold text-zinc-100">
        Settings
      </h1>
      <p className="mb-8 font-mono text-sm text-zinc-500">
        &gt; configuring human profile...
      </p>

      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <SettingsForm
          defaultValues={{
            displayName: user.displayName || "",
            avatarUrl: user.avatarUrl || "",
            bio: user.bio || "",
          }}
        />
      </div>
    </div>
  );
}
