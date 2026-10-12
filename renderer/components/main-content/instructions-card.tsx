import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";
import { Images, Sparkles, ShieldCheck } from "lucide-react";

function InstructionsCard({ version, batchMode }) {
  const t = useAtomValue(translationAtom);
  return (
    <section className="efv-welcome-card flex w-full max-w-[640px] flex-col items-center gap-5 px-8 py-10 text-center">
      <div className="efv-welcome-symbol"><Sparkles size={30} strokeWidth={1.5} /></div>
      <div className="text-[10px] font-semibold uppercase tracking-[.35em] text-sky-300">EF Ventures Labs · Creative Tools</div>
      <h1 className="text-4xl font-semibold tracking-tight text-white">Shutter<span className="text-sky-300">Upskal</span></h1>
      <p className="max-w-md text-base leading-relaxed text-slate-300">Bring your images into sharper focus with local AI-powered enhancement.</p>
      <div className="efv-welcome-dropzone w-full rounded-2xl p-8">
        <Images className="mx-auto mb-3 text-sky-300" size={32} strokeWidth={1.5}/>
        <p className="text-lg font-semibold text-white">{batchMode ? t("APP.RIGHT_PANE_INFO.SELECT_FOLDER") : t("APP.RIGHT_PANE_INFO.SELECT_IMAGE")}</p>
        <p className="mt-2 text-sm text-slate-300">{batchMode ? t("APP.RIGHT_PANE_INFO.SELECT_FOLDER_DESCRIPTION") : t("APP.RIGHT_PANE_INFO.SELECT_IMAGES_DESCRIPTION")}</p>
        {!batchMode && <p className="mt-2 text-xs text-slate-400">{t("APP.RIGHT_PANE_INFO.PASTE_IMAGE_DESCRIPTION")}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
        <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-sky-300"/> Processed on your computer</span>
        <span>Single image + batch workflows</span>
      </div>
      <p className="text-[11px] tracking-wider text-slate-400">SHUTTERUPSKAL v{version} · EFV EDITION</p>
    </section>
  );
}
export default InstructionsCard;
