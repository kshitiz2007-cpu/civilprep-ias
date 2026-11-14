import type { HTMLAttributes } from "react";
import "./gradient-text.css";

type GradientTextProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "rose" | "champagne" | "magenta";
  animate?: boolean;
};

export function GradientText({
  children,
  className = "",
  variant = "rose",
  animate = true,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={["rb-gradient-text", "rb-gradient-" + variant, animate ? "is-animated" : "", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
