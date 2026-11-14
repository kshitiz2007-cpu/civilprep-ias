"use client";

import { useState, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Landmark, Leaf, Scale, Telescope } from "lucide-react";
import "./circular-carousel.css";

export type CarouselItem = { eyebrow: string; title: string; description: string; label: string; tone?: "rose" | "gold" | "plum" | "sage"; href?: string };
const defaultItems: CarouselItem[] = [
  { eyebrow: "GENERAL STUDIES II", title: "Constitutional foundations", description: "Explore rights, institutions, federalism and the principles shaping India's constitutional democracy.", label: "POLITY", tone: "rose", href: "/resources" },
  { eyebrow: "GENERAL STUDIES III", title: "Economy & public policy", description: "Understand growth, public finance, inclusion and the policy choices behind a changing economy.", label: "ECONOMY", tone: "gold", href: "/resources" },
  { eyebrow: "GENERAL STUDIES I", title: "History & living heritage", description: "Connect historical processes, cultural traditions and the ideas that shaped modern India.", label: "HISTORY", tone: "plum", href: "/resources" },
  { eyebrow: "GENERAL STUDIES III", title: "Ecology & resilience", description: "Study biodiversity, climate, conservation and the systems that sustain life.", label: "ENVIRONMENT", tone: "sage", href: "/resources" },
  { eyebrow: "GENERAL STUDIES III", title: "Science & technology", description: "Make sense of emerging technologies, space, digital systems and strategic innovation.", label: "SCIENCE", tone: "rose", href: "/resources" },
];
const visuals = [Scale, Landmark, BookOpen, Leaf, Telescope];

export function CircularCarousel({ items = defaultItems }: { items?: CarouselItem[] }) {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const count = items.length;
  const change = (direction: number) => setActive((value) => (value + direction + count) % count);
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => setTouchStart(event.touches[0]?.clientX ?? null);
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
    if (Math.abs(delta) > 42) change(delta < 0 ? 1 : -1);
    setTouchStart(null);
  };
  if (!count) return null;
  const item = items[active];
  const Icon = visuals[active % visuals.length];
  return (
    <div className="rb-circular-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="rb-carousel-orbit" aria-hidden="true"><span/><span/><span/></div>
      <div className={"rb-carousel-stage rb-carousel-" + (item.tone || "rose")}>
        <div className="rb-carousel-orbit-label">{item.label}</div>
        <div className="rb-carousel-symbol"><Icon size={44} strokeWidth={1.2}/></div>
        <div className="rb-carousel-index">{String(active + 1).padStart(2, "0")} <i>/ {String(count).padStart(2, "0")}</i></div>
      </div>
      <div className="rb-carousel-copy" aria-live="polite">
        <span className="rb-carousel-eyebrow">{item.eyebrow}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <a href={item.href || "/resources"}>Explore this subject <ArrowRight size={15}/></a>
      </div>
      <div className="rb-carousel-controls">
        <div className="rb-carousel-dots">{items.map((entry, index) => <button key={entry.title} type="button" aria-label={"Show " + entry.title} aria-current={active === index ? "true" : undefined} className={active === index ? "active" : ""} onClick={() => setActive(index)}/>)}</div>
        <div className="rb-carousel-arrows"><button type="button" aria-label="Previous subject" onClick={() => change(-1)}><ArrowLeft size={17}/></button><button type="button" aria-label="Next subject" onClick={() => change(1)}><ArrowRight size={17}/></button></div>
      </div>
    </div>
  );
}
