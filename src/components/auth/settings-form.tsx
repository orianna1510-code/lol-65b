"use client";

import { useState } from "react";
import { updateProfileSchema } from "@/lib/validations/auth";
import { updateProfile } from "@/app/settings/actions";

type SettingsFormProps = {
  defaultValues: {
    displayName: string;
    avatarUrl: string;
    bio: string;
  };
};

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccess(false);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: (formData.get("displayName") as string) || undefined,
      avatarUrl: (formData.get("avatarUrl") as string) || undefined,
      bio: (formData.get("bio") as string) || undefined,
    };

    const result = updateProfileSchema.safeParse(data);
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

    const response = await updateProfile(formData);
    if (response?.error) {
      setServerError(response.error);
    } else {
      setSuccess(true);
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="displayName"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Display Name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={defaultValues.displayName}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="Your display name"
        />
        {errors.displayName && (
          <p className="mt-1 text-xs text-error">{errors.displayName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="avatarUrl"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={defaultValues.avatarUrl}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="https://example.com/avatar.png"
        />
        {errors.avatarUrl && (
          <p className="mt-1 text-xs text-error">{errors.avatarUrl}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-1 block font-mono text-xs text-zinc-400"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={defaultValues.bio}
          className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-mint focus:ring-1 focus:ring-mint"
          placeholder="Tell us about yourself..."
        />
        {errors.bio && (
          <p className="mt-1 text-xs text-error">{errors.bio}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg border border-error/20 bg-error/10 px-4 py-2 text-sm text-error">
          {serverError}
        </p>
      )}

      {success && (
        <p className="rounded-lg border border-mint/20 bg-mint/10 px-4 py-2 text-sm text-mint">
          Profile updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-mint px-6 py-3 font-mono text-sm font-semibold text-black transition-all hover:bg-mint-dim hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
