"use client";

import { useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import "./slide-commit.css";

type SlideCommitProps = {
  label?: string;
  successLabel?: string;
  onCommit: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
};

export function SlideCommit({ label = "Slide to complete", successLabel = "Completed", onCommit, className = "", disabled = false }: SlideCommitProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const finish = async () => {
    if (status === "loading" || status === "success" || disabled) return;
    setStatus("loading");
    try {
      await onCommit();
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Please try again.");
      setStatus("error");
      if (trackRef.current) animate(x, 0, { type: "spring", stiffness: 380, damping: 30 });
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    const width = trackRef.current?.getBoundingClientRect().width ?? 280;
    const threshold = Math.max(0, width - 68) * 0.78;
    if (info.offset.x >= threshold) {
      const max = Math.max(0, width - 56);
      animate(x, max, { type: "spring", stiffness: 360, damping: 32 });
      void finish();
    } else {
      animate(x, 0, { type: "spring", stiffness: 380, damping: 30 });
    }
  };

  return (
    <div className={"rb-slide-wrap " + className}>
      <div className={"rb-slide-track rb-slide-" + status} ref={trackRef}>
        <span className="rb-slide-label">{status === "success" ? successLabel : status === "loading" ? "Saving your progress…" : label}</span>
        <motion.div
          className="rb-slide-thumb"
          drag={disabled || status !== "idle" && status !== "error" ? false : "x"}
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onClick={() => { if (status === "error") { setStatus("idle"); setErrorMessage(""); animate(x, 0); } }}
          role="button"
          tabIndex={disabled || status === "success" || status === "loading" ? -1 : 0}
          aria-label={label}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void finish(); } }}
        >
          {status === "success" ? <Check size={18}/> : status === "loading" ? <LoaderCircle size={18} className="rb-slide-spin"/> : <ArrowRight size={18}/>}
        </motion.div>
      </div>
      {status === "error" && <p className="rb-slide-error" role="alert">{errorMessage || "Could not save. Tap the arrow to retry."}</p>}
    </div>
  );
}
