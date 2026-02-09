/**
 * Image generation provider abstraction.
 * Supports swapping between HuggingFace, Replicate, or any future provider.
 */

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  image: Buffer;
  model: string;
  provider: string;
}

export interface ImageProvider {
  readonly name: string;
  generate(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult>;
}

export async function getImageProvider(): Promise<ImageProvider> {
  // Prefer HuggingFace (free tier), fall back to Replicate
  if (process.env.HUGGINGFACE_API_KEY) {
    const { HuggingFaceProvider } = await import("./huggingface");
    return new HuggingFaceProvider();
  }

  if (process.env.REPLICATE_API_TOKEN) {
    const { ReplicateProvider } = await import("./replicate");
    return new ReplicateProvider();
  }

  throw new Error(
    "No image generation provider configured. Set HUGGINGFACE_API_KEY or REPLICATE_API_TOKEN."
  );
}
