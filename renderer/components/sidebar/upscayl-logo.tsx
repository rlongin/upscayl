import UpscaylSVGLogo from "../icons/upscayl-logo-svg";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";

const UpscaylLogo = () => {
  const [help, setHelp] = useState(false);
  return (
    <>
      <div className="fixed right-2 top-2 z-50 grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-1 rounded-lg bg-base-300 px-3 py-2 text-base-content">
        <div className="flex items-center gap-2">
          <UpscaylSVGLogo className="w-6" />
          <strong>ShutterUpskal</strong>
        </div>
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setHelp(true)}>Help</button>
        <small className="col-start-1 text-[10px] leading-tight opacity-70">by EF Ventures Lab</small>
      </div>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="max-h-[85vh] overflow-auto rounded-2xl bg-base-100 text-base-content">
          <DialogTitle>ShutterUpskal · Quick guide</DialogTitle>
          <DialogDescription>Enlarge images locally with the Upscayl engine.</DialogDescription>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Select an image, or enable Batch mode and select a folder.</li>
            <li>Choose a model and start with 2× or 4×. High Fidelity is a useful starting point for photos.</li>
            <li>Choose a separate output folder to keep originals intact.</li>
            <li>Start upscaling, then inspect faces and fine details before keeping the result.</li>
          </ol>
          <p className="my-4 text-sm">AI upscaling estimates details and cannot guarantee identical facial features. Processing runs on this computer and requires a Vulkan-compatible GPU.</p>
          <div className="flex flex-wrap gap-2">
            <a className="btn btn-primary btn-sm" href="https://members.efventures.app/messages" target="_blank" rel="noopener noreferrer">Find a Core Steward in Direct Messages</a>
            <a className="btn btn-ghost btn-sm" href="https://docs.upscayl.org/" target="_blank" rel="noopener noreferrer">Troubleshooting</a>
            <a className="btn btn-ghost btn-sm" href="https://github.com/rlongin/upscayl/tree/efv-shutterupskal" target="_blank" rel="noopener noreferrer">Source code</a>
          </div>
          <p className="my-4 text-xs">EF Ventures branded edition of Upscayl. Original authors and AGPL-3.0 license retained. Independent project; no upstream endorsement implied.</p>
          <button autoFocus type="button" className="btn btn-sm" onClick={() => setHelp(false)}>Close</button>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default UpscaylLogo;
