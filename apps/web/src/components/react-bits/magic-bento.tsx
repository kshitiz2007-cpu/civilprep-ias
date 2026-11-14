"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, BookOpen, BrainCircuit, ChartNoAxesCombined, Compass, Newspaper, Target } from "lucide-react";
import "./magic-bento.css";

export type BentoItem = {
  eyebrow: string;
  title: string;
  description: string;
  icon: "book" | "brain" | "news" | "target" | "chart" | "compass";
  accent?: "rose" | "gold" | "plum" | "sage";
  size?: "wide" | "tall" | "standard";
  href?: string;
  metric?: string;
};

const icons = {
  book: BookOpen,
  brain: BrainCircuit,
  news: Newspaper,
  target: Target,
  chart: ChartNoAxesCombined,
  compass: Compass,
};

const defaults: BentoItem[] = [
  { eyebrow: "01 / KNOWLEDGE", title: "Learn in connected layers", description: "Move from foundational concepts to exam-ready understanding with a syllabus-aware knowledge library.", icon: "book", accent: "rose", size: "wide", metric: "12 subject domains", href: "/resources" },
  { eyebrow: "02 / INTELLIGENCE", title: "Think beyond the headline", description: "Connect the day's developments to constitutional values, policy choices and GS themes.", icon: "news", accent: "gold", metric: "Daily Crux", href: "/current-affairs" },
  { eyebrow: "03 / PRACTICE", title: "Practice with precision", description: "Build accuracy through daily drills, PYQs, sectional tests and full-length simulations.", icon: "target", accent: "plum", metric: "Prelims + Mains", href: "/app/practice/daily-drill" },
  { eyebrow: "04 / REASONING", title: "Build analytical depth", description: "Turn facts into arguments with guided frameworks, examples and answer-writing practice.", icon: "brain", accent: "sage", metric: "Answer Studio", href: "/app/mains" },
  { eyebrow: "05 / PERFORMANCE", title: "See your progress clearly", description: "Understand strengths, gaps and revision priorities without losing sight of the bigger goal.", icon: "chart", accent: "gold", metric: "Personal insights", href: "/app/performance" },
  { eyebrow: "06 / DIRECTION", title: "Know what comes next", description: "A focused learning path keeps every session purposeful, measurable and connected.", icon: "compass", accent: "rose", metric: "Your next best step", href: "/app/plan" },
];

export function MagicBento({ items = defaults }: { items?: BentoItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  const moveGlow = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", (event.clientX - rect.left) + "px");
    event.currentTarget.style.setProperty("--pointer-y", (event.clientY - rect.top) + "px");
  };

  return (
    <div className="rb-magic-bento" ref={gridRef}>
      {items.map((item, index) => {
        const Icon = icons[item.icon];
        const content = (
          <>
            <div className="rb-bento-topline">
              <span className="rb-bento-icon"><Icon size={20} strokeWidth={1.7} /></span>
              <span className="rb-bento-index">0{index + 1}</span>
            </div>
            <span className="rb-bento-eyebrow">{item.eyebrow}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="rb-bento-bottom">
              <span>{item.metric}</span>
              <span className="rb-bento-arrow"><ArrowUpRight size={17} /></span>
            </div>
          </>
        );
        return item.href ? (
          <a
            href={item.href}
            key={item.title}
            className={"rb-bento-card rb-bento-" + (item.accent || "rose") + " rb-bento-" + (item.size || "standard")}
            onPointerMove={moveGlow}
            style={{ "--bento-order": index } as CSSProperties}
          >
            {content}
          </a>
        ) : (
          <article
            key={item.title}
            className={"rb-bento-card rb-bento-" + (item.accent || "rose") + " rb-bento-" + (item.size || "standard")}
            onPointerMove={moveGlow}
            style={{ "--bento-order": index } as CSSProperties}
          >
            {content}
          </article>
        );
      })}
    </div>
  );
}
