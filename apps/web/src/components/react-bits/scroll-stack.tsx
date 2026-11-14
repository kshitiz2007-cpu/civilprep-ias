import type { CSSProperties, ReactNode } from "react";
import "./scroll-stack.css";

export function ScrollStack({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"rb-scroll-stack " + className}>{children}</div>;
}

export function ScrollStackItem({ children, index = 0, className = "" }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <article className={"rb-scroll-stack-item " + className} style={{ "--stack-index": index } as CSSProperties}>
      {children}
    </article>
  );
}
