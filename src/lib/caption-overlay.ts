import sharp from "sharp";

export interface CaptionOptions {
  topText?: string;
  bottomText?: string;
  fontSize?: number;
}

const DEFAULT_FONT_SIZE = 48;
const STROKE_WIDTH = 3;
const PADDING = 20;

/**
 * Add meme-style captions to an image using sharp SVG overlay.
 * White text with black stroke — classic Impact meme format.
 */
export async function addCaptions(
  imageBuffer: Buffer,
  options: CaptionOptions
): Promise<Buffer> {
  const { topText, bottomText, fontSize = DEFAULT_FONT_SIZE } = options;

  if (!topText && !bottomText) {
    return imageBuffer;
  }

  // Single sharp instance — reuse via clone to avoid memory leaks
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;

  const svgParts: string[] = [];

  if (topText) {
    svgParts.push(
      buildTextSvg(topText, width, fontSize, PADDING + fontSize, STROKE_WIDTH)
    );
  }

  if (bottomText) {
    svgParts.push(
      buildTextSvg(
        bottomText,
        width,
        fontSize,
        height - PADDING,
        STROKE_WIDTH
      )
    );
  }

  const svgOverlay = `
    <svg width="${width}" height="${height}">
      ${svgParts.join("\n")}
    </svg>
  `;

  return image
    .clone()
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

function buildTextSvg(
  text: string,
  width: number,
  fontSize: number,
  y: number,
  strokeWidth: number
): string {
  // Escape XML special characters, strip non-ASCII to prevent Unicode SVG attacks
  const escaped = text
    .slice(0, 200) // Hard limit per caption
    .replace(/[^\x20-\x7E]/g, "") // Strip non-ASCII
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\n/g, " ") // Strip newlines
    .toUpperCase();

  return `
    <text
      x="${width / 2}"
      y="${y}"
      text-anchor="middle"
      font-family="Impact, Arial Black, sans-serif"
      font-size="${fontSize}"
      font-weight="bold"
      fill="white"
      stroke="black"
      stroke-width="${strokeWidth}"
      paint-order="stroke"
    >${escaped}</text>
  `;
}
