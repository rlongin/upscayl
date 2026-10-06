import fs from "fs";
import path from "path";
import { nativeImage } from "electron";

type AuthenticUpscaleOptions = {
  inputPath: string;
  outputPath: string;
  scale: string | number;
  customWidth?: string | number;
  useCustomWidth?: boolean;
  saveImageAs: string;
};

const encode = (image: Electron.NativeImage, format: string) => {
  const normalized = format.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return image.toJPEG(95);
  if (normalized === "png") return image.toPNG();
  throw new Error(
    `Authentic HD compatibility mode currently supports PNG and JPEG output, not ${format}.`,
  );
};

export const authenticUpscaleImage = async ({
  inputPath,
  outputPath,
  scale,
  customWidth,
  useCustomWidth,
  saveImageAs,
}: AuthenticUpscaleOptions) => {
  const image = nativeImage.createFromPath(inputPath);
  if (image.isEmpty()) throw new Error(`Could not decode image: ${inputPath}`);

  const size = image.getSize();
  const scaleNumber = Number(scale) > 0 ? Number(scale) : 2;
  const requestedWidth =
    useCustomWidth && Number(customWidth) > 0
      ? Number(customWidth)
      : Math.round(size.width * scaleNumber);
  const targetWidth = Math.max(1, requestedWidth);

  // Electron's "best" resize is deterministic: it resamples existing pixels
  // without generating/reconstructing facial or scene content.
  const resized = image.resize({ width: targetWidth, quality: "best" });
  const output = encode(resized, saveImageAs);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error("Authentic HD compatibility mode did not create a valid output image.");
  }

  return outputPath;
};

export const authenticUpscaleFolder = async ({
  inputDir,
  outputDir,
  scale,
  customWidth,
  useCustomWidth,
  saveImageAs,
  onProgress,
}: {
  inputDir: string;
  outputDir: string;
  scale: string | number;
  customWidth?: string | number;
  useCustomWidth?: boolean;
  saveImageAs: string;
  onProgress?: (message: string) => void;
}) => {
  const supported = new Set([".png", ".jpg", ".jpeg"]);
  const files = fs
    .readdirSync(inputDir)
    .filter((file) => supported.has(path.extname(file).toLowerCase()));

  if (!files.length) throw new Error("No PNG or JPEG images were found for Authentic HD fallback.");

  fs.mkdirSync(outputDir, { recursive: true });

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(
      outputDir,
      `${path.parse(file).name}.${saveImageAs.toLowerCase()}`,
    );
    onProgress?.(
      `Authentic HD compatibility mode: ${index + 1}/${files.length} — ${file}`,
    );
    await authenticUpscaleImage({
      inputPath,
      outputPath,
      scale,
      customWidth,
      useCustomWidth,
      saveImageAs,
    });
  }

  return files.length;
};
