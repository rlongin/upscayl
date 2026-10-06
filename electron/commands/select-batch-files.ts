import fs from "fs";
import osPath from "path";
import { app, dialog } from "electron";
import logit from "../utils/logit";

const VALID_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".jfif", ".webp"]);

const selectBatchFiles = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    title: "Select Images",
    message: "Select Images to Upscale",
    filters: [
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "jfif", "webp"],
      },
    ],
  });

  if (canceled || filePaths.length === 0) {
    logit("🚫 Batch image selection cancelled");
    return null;
  }

  const validFiles = filePaths.filter((file) =>
    VALID_EXTENSIONS.has(osPath.extname(file).toLowerCase()),
  );

  if (validFiles.length === 0) {
    return null;
  }

  // Stock Upscayl batch processing accepts a folder. Stage only the images
  // selected by the user into a temporary folder, then hand that folder to
  // the untouched upstream batch backend.
  const stagingRoot = osPath.join(
    app.getPath("temp"),
    "ShutterUpskal",
    `batch-selection-${Date.now()}-${process.pid}`,
  );
  fs.mkdirSync(stagingRoot, { recursive: true });

  validFiles.forEach((source, index) => {
    const ext = osPath.extname(source);
    const base = osPath.basename(source, ext);
    let destination = osPath.join(stagingRoot, osPath.basename(source));

    // Avoid collisions when selected images from different folders share a name.
    if (fs.existsSync(destination)) {
      destination = osPath.join(stagingRoot, `${base}-${index + 1}${ext}`);
    }

    fs.copyFileSync(source, destination);
  });

  const defaultOutputPath = osPath.dirname(validFiles[0]);
  logit(`📄 Selected ${validFiles.length} image(s) for batch Upscayl`);

  return {
    batchFolderPath: stagingRoot,
    outputPath: defaultOutputPath,
    selectedCount: validFiles.length,
  };
};

export default selectBatchFiles;
