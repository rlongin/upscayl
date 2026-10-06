import fs from "fs";
import path from "path";
import { app } from "electron";

const ensureDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

export const createStagedOutputFile = (extension: string) => {
  const dir = ensureDir(path.join(app.getPath("temp"), "ShutterUpskal", "output"));
  const ext = extension.replace(/^\./, "").toLowerCase();
  return path.join(dir, `gpu-${process.pid}-${Date.now()}.${ext}`);
};

export const createStagedOutputFolder = () =>
  ensureDir(
    path.join(
      app.getPath("temp"),
      "ShutterUpskal",
      `batch-${process.pid}-${Date.now()}`,
    ),
  );

export const finalizeStagedFile = (
  stagedFile: string,
  requestedFile: string,
) => {
  try {
    ensureDir(path.dirname(requestedFile));
    fs.copyFileSync(stagedFile, requestedFile);
    fs.rmSync(stagedFile, { force: true });
    return { outputPath: requestedFile, recovered: false };
  } catch (error) {
    const rescueDir = ensureDir(path.join(app.getPath("pictures"), "ShutterUpskal"));
    const ext = path.extname(requestedFile) || path.extname(stagedFile) || ".png";
    const rescueFile = path.join(
      rescueDir,
      `ShutterUpskal-${Date.now()}${ext}`,
    );
    fs.copyFileSync(stagedFile, rescueFile);
    fs.rmSync(stagedFile, { force: true });
    return { outputPath: rescueFile, recovered: true, originalError: error };
  }
};

export const finalizeStagedFolder = (
  stagedFolder: string,
  requestedFolder: string,
) => {
  let finalFolder = requestedFolder;
  let recovered = false;
  let originalError: unknown;

  try {
    ensureDir(finalFolder);
    const probe = path.join(finalFolder, `.shutterupskal-write-${Date.now()}`);
    fs.writeFileSync(probe, "ok");
    fs.rmSync(probe, { force: true });
  } catch (error) {
    recovered = true;
    originalError = error;
    finalFolder = ensureDir(
      path.join(
        app.getPath("pictures"),
        "ShutterUpskal",
        `Batch-${Date.now()}`,
      ),
    );
  }

  for (const file of fs.readdirSync(stagedFolder)) {
    const source = path.join(stagedFolder, file);
    if (!fs.statSync(source).isFile()) continue;
    fs.copyFileSync(source, path.join(finalFolder, file));
  }

  fs.rmSync(stagedFolder, { recursive: true, force: true });
  return { outputFolder: finalFolder, recovered, originalError };
};
