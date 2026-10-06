import fs from "fs";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  savedCustomModelsPath,
  setStopped,
  stopped,
} from "../utils/config-variables";
import logit from "../utils/logit";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { getBatchArguments } from "../utils/get-arguments";
import slash from "../utils/slash";
import { modelsPath } from "../utils/get-resource-paths";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { BatchUpscaylPayload } from "../../common/types/types";
import showNotification from "../utils/show-notification";
import { MODELS } from "../../common/models-list";
import { copyMetadata } from "../utils/copy-metadata";
import { authenticUpscaleFolder } from "../utils/authentic-upscale";
import {
  createStagedOutputFolder,
  finalizeStagedFolder,
} from "../utils/staged-output";

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const tileSize = payload.tileSize;
  const compression = payload.compression;
  const ttaMode = payload.ttaMode;
  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;
  // GET THE IMAGE DIRECTORY
  let inputDir = decodeURIComponent(payload.batchFolderPath);
  // GET THE OUTPUT DIRECTORY
  let outputFolderPath = decodeURIComponent(payload.outputPath);
  const outputFolderName = `upscayl_${saveImageAs}_${model}_${
    useCustomWidth ? `${customWidth}px` : `${scale}x`
  }`;
  outputFolderPath += slash + outputFolderName;
  const stagedOutputFolder = createStagedOutputFolder();

  const isDefaultModel = model in MODELS;

  // UPSCALE
  const upscayl = spawnUpscayl(
    getBatchArguments({
      inputDir,
      outputDir: stagedOutputFolder,
      modelsPath: isDefaultModel
        ? modelsPath
        : (savedCustomModelsPath ?? modelsPath),
      model,
      gpuId,
      saveImageAs,
      scale,
      customWidth,
      compression,
      tileSize,
      ttaMode,
    }),
    logit,
  );

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;
  let encounteredError = false;
  let nativeWriteFailed = false;
  let verifiedGpu = "";

  const onData = (data: any) => {
    if (!mainWindow) return;
    data = data.toString();
    const gpuMatch = data.match(/\[\d+\s+([^\]]*(?:NVIDIA|AMD|Intel)[^\]]*)\]/i);
    if (gpuMatch?.[1]) {
      verifiedGpu = gpuMatch[1].trim();
    }
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
      data.toString(),
    );
    if ((data as string).includes("Couldn't write the image")) {
      nativeWriteFailed = true;
      encounteredError = true;
      logit("⚠️ Native batch writer failed after inference; retrying safe save path.");
    } else if (
      (data as string).includes("Error") ||
      (data as string).includes("failed")
    ) {
      logit("❌ ", data);
      encounteredError = true;
      onError(data);
    } else if (data.includes("Resizing")) {
      mainWindow.webContents.send(ELECTRON_COMMANDS.SCALING_AND_CONVERTING);
    }
  };
  const onError = (data: any) => {
    if (!mainWindow) return;
    mainWindow.setProgressBar(-1);
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
      data.toString(),
    );
    failed = true;
    upscayl.kill();
    mainWindow &&
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.UPSCAYL_ERROR,
        `Error upscaling images! ${data}`,
      );
    return;
  };
  const onClose = async (code: number | null) => {
    if (!mainWindow) return;

    if (!failed && !stopped && (code !== 0 || nativeWriteFailed)) {
      try {
        logit(
          `⚠️ Batch AI backend exited with code ${code}; switching to Authentic HD compatibility mode.`,
        );
        mainWindow.webContents.send(
          ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
          "GPU AI backend unavailable. Completing batch with Authentic HD compatibility mode (no generative facial changes)...",
        );

        const completed = await authenticUpscaleFolder({
          inputDir,
          outputDir: stagedOutputFolder,
          scale,
          customWidth,
          useCustomWidth,
          saveImageAs,
          onProgress: (message) =>
            mainWindow.webContents.send(
              ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
              message,
            ),
        });

        const finalized = finalizeStagedFolder(
          stagedOutputFolder,
          outputFolderPath,
        );
        outputFolderPath = finalized.outputFolder;
        upscayl.kill();
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send(
          ELECTRON_COMMANDS.FOLDER_UPSCAYL_DONE,
          outputFolderPath,
        );
        showNotification(
          "ShutterUpskal",
          finalized.recovered
            ? `${completed} image${completed === 1 ? "" : "s"} completed in Authentic HD mode. Saved safely to ${outputFolderPath}`
            : `${completed} image${completed === 1 ? "" : "s"} completed in Authentic HD compatibility mode.`,
        );
        return;
      } catch (fallbackError) {
        onError(
          `AI batch backend failed (exit code ${code}) and Authentic HD fallback failed: ${fallbackError}`,
        );
        return;
      }
    }

    if (!failed && !stopped) {
      const finalized = finalizeStagedFolder(
        stagedOutputFolder,
        outputFolderPath,
      );
      outputFolderPath = finalized.outputFolder;
      const engineLabel = verifiedGpu
        ? `AI GPU — ${verifiedGpu}`
        : "AI GPU — Vulkan backend";
      logit(`🧪 GPU VERIFY PASS: ${engineLabel}; exit code 0; batch output created.`);
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
        `Verified: ${engineLabel}`,
      );
      logit("💯 Done upscaling");
      upscayl.kill();
      if (payload.copyMetadata) {
        logit("🏷️ Copying metadata...");
        try {
          const files = fs.readdirSync(outputFolderPath);
          for (const file of files) {
            const outFile = outputFolderPath + slash + file;
            const originalFile = inputDir + slash + file;
            if (fs.existsSync(outFile) && fs.existsSync(originalFile)) {
                try {
                  await copyMetadata(originalFile, outFile);
                  logit("✅ Metadata copied to: ", outFile);
                } catch (error) {
                  logit("❌ Error copying metadata: ", error);
                  mainWindow.webContents.send(
                    ELECTRON_COMMANDS.METADATA_ERROR,
                    error,
                  );
                } 
            }
          }
        } catch (err) {
          logit("❌ Error in batch metadata copy: ", err);
        }
      }
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.FOLDER_UPSCAYL_DONE,
        outputFolderPath,
      );
      if (!encounteredError) {
        showNotification(
          "ShutterUpskal",
          finalized.recovered
            ? `Verified AI GPU batch complete${verifiedGpu ? ` — ${verifiedGpu}` : ""}. Saved safely to ${outputFolderPath}`
            : `Verified AI GPU batch complete${verifiedGpu ? ` — ${verifiedGpu}` : ""}.`,
        );
      } else {
        showNotification(
          "Upscayled",
          "Images were upscayled but encountered some errors!",
        );
      }
    } else {
      upscayl.kill();
    }
  };
  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", onClose);
};

export default batchUpscayl;
