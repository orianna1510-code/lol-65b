import sharp from "sharp";

export interface CaptionOptions {
  topText?: string;
  bottomText?: string;
  fontSize?: number;
}

const DEFAULT_FONT_SIZE = 48;
const STROKE_WIDTH = 3;
const PADDING = 20;
// Impact font: average character width ≈ 0.7 × fontSize (conservative to handle wide chars like M, W)
const CHAR_WIDTH_RATIO = 0.7;

/**
 * Add meme-style captions to an image using sharp SVG overlay.
 * White text with black stroke — classic Impact meme format.
 * Long captions auto-wrap to fit within the image width.
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
      buildTextSvg(topText, width, fontSize, "top", STROKE_WIDTH)
    );
  }

  if (bottomText) {
    svgParts.push(
      buildTextSvg(bottomText, width, fontSize, "bottom", STROKE_WIDTH, height)
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

/**
 * Wrap text into lines that fit within the available width.
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildTextSvg(
  text: string,
  width: number,
  fontSize: number,
  position: "top" | "bottom",
  strokeWidth: number,
  imageHeight?: number
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

  const usableWidth = width - PADDING * 2;
  const charWidth = fontSize * CHAR_WIDTH_RATIO;
  const maxCharsPerLine = Math.max(1, Math.floor(usableWidth / charWidth));
  const lines = wrapText(escaped, maxCharsPerLine);
  const lineHeight = fontSize * 1.2;

  let startY: number;
  if (position === "top") {
    startY = PADDING + fontSize;
  } else {
    // Bottom: position so last line sits at (imageHeight - PADDING)
    const h = imageHeight ?? 1024;
    startY = h - PADDING - (lines.length - 1) * lineHeight;
  }

  const tspans = lines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `<tspan x="${width / 2}" y="${y}">${line}</tspan>`;
    })
    .join("\n      ");

  return `
    <text
      text-anchor="middle"
      font-family="Impact, Arial Black, sans-serif"
      font-size="${fontSize}"
      font-weight="bold"
      fill="white"
      stroke="black"
      stroke-width="${strokeWidth}"
      paint-order="stroke"
    >
      ${tspans}
    </text>
  `;
}
