import fs from "fs";
import path from "path";
import os from "os";

const stagedFolders = new Set<string>();

export function stageSelectedImages(filePaths: string[]) {
  const folderPath = fs.mkdtempSync(path.join(os.tmpdir(), "shutterupskal-selection-"));
  stagedFolders.add(folderPath);
  const names = new Set<string>();
  try {
    for (const file of filePaths) {
      const parsed = path.parse(file);
      let stem = parsed.name;
      let suffix = 2;
      while (names.has(stem.toLowerCase())) stem = `${parsed.name}-${suffix++}`;
      names.add(stem.toLowerCase());
      fs.copyFileSync(file, path.join(folderPath, stem + parsed.ext));
    }
    return { folderPath, count: filePaths.length, outputPath: path.dirname(filePaths[0]) };
  } catch (error) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    stagedFolders.delete(folderPath);
    throw error;
  }
}

export function cleanupSelectedImages() {
  for (const folder of stagedFolders) {
    try { fs.rmSync(folder, { recursive: true, force: true }); } catch { /* Retry at next exit. */ }
  }
}
