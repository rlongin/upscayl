import React, { useEffect, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import useTranslation from "../hooks/use-translation";

const SliderView = ({ sanitizedImagePath, sanitizedUpscaledImagePath, zoomAmount }: {
  sanitizedImagePath: string;
  sanitizedUpscaledImagePath: string;
  zoomAmount: string;
}) => {
  const t = useTranslation();
  const original = "file:///" + sanitizedImagePath;
  const processed = "file:///" + sanitizedUpscaledImagePath;
  const [loaded, setLoaded] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pair = original + "|" + processed;

  useEffect(() => {
    let active = true;
    setLoaded(null);
    setError("");
    const images = [new Image(), new Image()];
    let remaining = images.length;
    images.forEach((image, index) => {
      image.onload = () => { if (active && --remaining === 0) setLoaded(pair); };
      image.onerror = () => { if (active) setError(index === 1
        ? "The processed image could not be loaded. Open the output folder to check the saved file."
        : "The original image could not be loaded. Select the image again."); };
      image.src = index === 0 ? original : processed;
    });
    return () => { active = false; images.forEach(image => { image.onload = null; image.onerror = null; }); };
  }, [original, processed, pair]);

  if (error) return <p role="alert" className="max-w-lg p-6 text-center">{error}</p>;
  if (loaded !== pair) return <p role="status">Loading before and after images…</p>;
  const scale = Math.max(1, Number.parseFloat(zoomAmount) / 100 || 1);
  const pane = (src: string, title: string, right: boolean) => (
    <div className="relative h-full w-full overflow-hidden">
      <ReactCompareSliderImage src={src} alt={title} style={{ objectFit: "contain", width: "100%", height: "100%", transform: `scale(${scale})` }} />
      <p className={`absolute bottom-2 z-10 rounded-md bg-black/70 p-1 text-sm text-white ${right ? "right-2" : "left-2"}`}>{title}</p>
    </div>
  );
  return <ReactCompareSlider key={pair}
    itemOne={pane(original, t("APP.SLIDER.ORIGINAL_TITLE"), false)}
    itemTwo={pane(processed, t("APP.SLIDER.UPSCAYLED_TITLE"), true)}
    className="h-full w-full" style={{ width: "100%", height: "100%" }} />;
};
export default SliderView;
