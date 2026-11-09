"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import "./zenith-command-palette.css";

const commands = [
  { title: "Syllabus Hub", detail: "Explore GS papers and topics", path: "/syllabus/upsc/gs" },
  { title: "Editorial Pulse", detail: "Current affairs through three depths", path: "/pulse" },
  { title: "Lexicon", detail: "Constitutional and policy concepts", path: "/lexicon" },
  { title: "PYQ Archive", detail: "Previous-year questions by paper", path: "/pyq" },
  { title: "Answer Studio", detail: "Mains writing workspace", path: "/studio/mains" },
  { title: "Test Arena", detail: "Practice and assessment", path: "/arena" },
  { title: "Atomic Vault", detail: "Your connected notes and revision", path: "/vault" },
  { title: "Student Desk", detail: "Your daily learning workspace", path: "/app" },
] as const;

export function ZenithCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((item) => `${item.title} ${item.detail} ${item.path}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button className="zenith-command-trigger" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Open command palette">
        <Search size={15} /><span>Search knowledge</span><kbd><Command size={10} /> K</kbd>
      </button>
      {open && <div className="zenith-command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className="zenith-command-dialog" role="dialog" aria-modal="true" aria-label="Knowledge command palette">
          <div className="zenith-command-search"><Search size={18} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
            if (event.key === "Enter" && results[active]) navigate(results[active].path);
          }} placeholder="Search a topic, module or canonical path…" aria-label="Search a topic, module or canonical path" /><button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X size={17} /></button></div>
          <div className="zenith-command-caption">NAVIGATE YOUR KNOWLEDGE SPACE</div>
          <div className="zenith-command-results">{results.map((item, index) => <button key={item.path} type="button" className={index === active ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => navigate(item.path)}><span><b>{item.title}</b><small>{item.detail}</small></span><code>{item.path}</code><ArrowUpRight size={15} /></button>)}{results.length === 0 && <p>No matching destination. Try a module name or slug.</p>}</div>
          <div className="zenith-command-foot"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></div>
        </section>
      </div>}
    </>
  );
}
