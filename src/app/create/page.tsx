import { requireAuth } from "@/lib/auth";
import { CreateMemeForm } from "@/components/meme/create-meme-form";

export const metadata = {
  title: "Create Meme — LOL-65B",
};

export default async function CreatePage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-1 font-mono text-2xl font-bold text-zinc-100">
        Create Meme
      </h1>
      <p className="mb-8 font-mono text-sm text-zinc-500">
        &gt; describe your meme concept and let the model handle the rest
      </p>

      <CreateMemeForm />
    </div>
  );
}
