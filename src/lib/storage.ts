import "server-only";
import { createServiceClient } from "@/lib/supabase-server";

const BUCKET_NAME = "memes";

/**
 * Upload a meme image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
const VALID_ID_PATTERN = /^[a-z0-9-]{20,50}$/;

export async function uploadMemeImage(
  imageBuffer: Buffer,
  memeId: string
): Promise<string> {
  // Defense-in-depth: validate ID format to prevent path traversal
  if (!VALID_ID_PATTERN.test(memeId)) {
    throw new Error("Invalid memeId format");
  }

  const supabase = createServiceClient();
  const filePath = `${memeId}.png`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload meme image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete a meme image from Supabase Storage.
 */
export async function deleteMemeImage(memeId: string): Promise<void> {
  const supabase = createServiceClient();
  const filePath = `${memeId}.png`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete meme image: ${error.message}`);
  }
}
