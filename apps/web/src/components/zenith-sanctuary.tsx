"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDownRight01Icon, ArrowRight01Icon, BookOpen01Icon, CompassIcon, Layers01Icon, Search01Icon, SparklesIcon } from "@hugeicons/core-free-icons";

const ArrowRight = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={ArrowRight01Icon} size={size} strokeWidth={1.7} />;
const ArrowDownRight = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={ArrowDownRight01Icon} size={size} strokeWidth={1.7} />;
const BookOpen = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={BookOpen01Icon} size={size} strokeWidth={1.7} />;
const Compass = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={CompassIcon} size={size} strokeWidth={1.7} />;
const Layers3 = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={Layers01Icon} size={size} strokeWidth={1.7} />;
const Search = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={Search01Icon} size={size} strokeWidth={1.7} />;
const Sparkles = ({ size = 16 }: { size?: number }) => <HugeiconsIcon icon={SparklesIcon} size={size} strokeWidth={1.7} />;
import { ZenithThemeControl } from "./zenith-theme-provider";
import "./zenith-sanctuary.css";

const editorialLayers = [
  { id: "surface", label: "The signal", title: "What happened?", body: "A concise, bilingual brief that separates the event from the noise.", detail: "Start with the verified development, the institution involved, the date, and the primary source." },
  { id: "context", label: "The context", title: "Why does it matter?", body: "Constitutional, historical, economic and institutional context in one connected reading path.", detail: "Trace the constitutional provisions, committee recommendations, previous policy decisions and linked syllabus themes." },
  { id: "analysis", label: "The lens", title: "What should an aspirant think?", body: "Arguments, counterpoints and a mains-ready analytical frame—not a pre-written opinion.", detail: "Build a balanced position with stakeholders, implementation gaps, federal dimensions, ethical questions and practical way forward." },
] as const;

const constellation = [
  { id: "polity", code: "GS II", name: "Polity & Governance", topics: "Constitution · Parliament · Federalism", tone: "sage" },
  { id: "economy", code: "GS III", name: "Economy", topics: "Growth · Inclusion · Public finance", tone: "clay" },
  { id: "history", code: "GS I", name: "History & Society", topics: "Modern India · Culture · Social change", tone: "indigo" },
  { id: "ethics", code: "GS IV", name: "Ethics & Integrity", topics: "Thinkers · Case studies · Aptitude", tone: "sand" },
] as const;

export function ZenithSanctuary() {
  const [layer, setLayer] = useState<(typeof editorialLayers)[number]["id"]>("surface");
  const [activeTopic, setActiveTopic] = useState("polity");
  const [query, setQuery] = useState("");
  const currentLayer = editorialLayers.find((item) => item.id === layer) ?? editorialLayers[0];
  const filteredTopics = useMemo(() => constellation.filter((item) => `${item.name} ${item.topics} ${item.code}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="zenith-page">
      <header className="zenith-nav">
        <a className="zenith-brand" href="/" aria-label="CivilPrep home">
          <span className="zenith-brand-mark"><Layers3 size={21} /></span>
          <span><strong>CivilPrep</strong><small>THE KNOWLEDGE SANCTUARY</small></span>
        </a>
        <nav aria-label="Main navigation" className="zenith-nav-links">
          <a href="#editorial">Editorial Lens</a><a href="#constellation">Syllabus Map</a><a href="#principles">Our method</a>
        </nav>
        <div className="zenith-nav-actions"><ZenithThemeControl /><a className="zenith-login" href="/login">Sign in <ArrowRight size={15} /></a></div>
      </header>

      <section className="zenith-hero">
        <div className="zenith-hero-copy">
          <div className="zenith-overline"><span /> A calmer way to prepare for what matters</div>
          <h1><span className="zenith-title-line">Knowledge is not</span><span className="zenith-title-line zenith-title-emphasis"><em>a pile of facts.</em></span><span className="zenith-title-line zenith-title-last">It is a connected world<span className="zenith-title-period">.</span></span></h1>
          <p>One knowledge identity. Multiple learning experiences. A living study space for UPSC and State PCS—built to help you understand deeply, connect ideas and write with clarity.</p>
          <div className="zenith-hero-actions"><a className="zenith-primary" href="/onboarding/1">Enter your sanctuary <ArrowRight size={16} /></a><a className="zenith-secondary" href="#constellation">Explore the knowledge map <ArrowDownRight size={16} /></a></div>
          <div className="zenith-proof"><span><BookOpen size={15} /> Bilingual by design</span><span><Compass size={15} /> Syllabus-connected</span><span><Sparkles size={15} /> Built for understanding</span></div>
        </div>
        <div className="zenith-hero-art" aria-label="Illustrated learning pathways connecting syllabus, editorial analysis, revision and previous-year questions">
          <div className="zenith-map-header"><span>THE CIVILPREP ATLAS</span><span>01 / 04</span></div>
          <div className="zenith-map-main">
            <div className="zenith-map-spine" aria-hidden="true" />
            <div className="zenith-map-card zenith-map-card-main"><span className="zenith-map-number">01 / FOUNDATION</span><BookOpen size={27} /><strong>Learn the<br />essentials.</strong><small>Concepts · Syllabus</small></div>
            <div className="zenith-map-card zenith-map-card-editorial"><span className="zenith-map-number">02 / CONTEXT</span><Sparkles size={24} /><strong>Connect<br />the dots.</strong><small>Editorial · Analysis</small></div>
            <div className="zenith-map-card zenith-map-card-practice"><span className="zenith-map-number">03 / PRACTICE</span><Compass size={24} /><strong>Think. Apply.<br />Reflect.</strong><small>PYQs · Mains</small></div>
            <div className="zenith-map-card zenith-map-card-revision"><span className="zenith-map-number">04 / RETENTION</span><Layers3 size={24} /><strong>Make it<br />your own.</strong><small>Notes · Revision</small></div>
          </div>
          <div className="zenith-map-bottom"><span>ONE CONNECTED LEARNING JOURNEY</span><span className="zenith-map-star">✳</span></div>
        </div>
      </section>

      <section className="zenith-principles" id="principles">
        <div><span>01 / CONNECTED</span><b>Every idea has a place.</b><small>Topics, editorials, PYQs and notes share one canonical identity.</small></div>
        <div><span>02 / CONTEXTUAL</span><b>Every fact has a why.</b><small>Move from the news signal to context, then to critical analysis.</small></div>
        <div><span>03 / PERSONAL</span><b>Your learning has a rhythm.</b><small>A calm study environment that adapts to your time and preference.</small></div>
      </section>

      <section className="zenith-section" id="editorial">
        <div className="zenith-section-heading"><div><span className="zenith-kicker">THE EDITORIAL LENS / 01</span><h2>Read beyond the headline.</h2><p>Three depths. One coherent understanding. Explore how a current issue becomes a useful learning asset.</p></div><span className="zenith-index">01 — 03</span></div>
        <div className="zenith-editorial-card">
          <div className="zenith-layer-list" role="tablist" aria-label="Editorial reading depth">
            {editorialLayers.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={layer === item.id} className={layer === item.id ? "active" : ""} onClick={() => setLayer(item.id)}><span>0{index + 1}</span><b>{item.label}</b><ArrowRight size={15} /></button>)}
          </div>
          <div className="zenith-layer-content" role="tabpanel"><span className="zenith-kicker">A THREE-DEPTH READING MODEL</span><h3>{currentLayer.title}</h3><p>{currentLayer.body}</p><div className="zenith-layer-detail"><Sparkles size={17} /><span>{currentLayer.detail}</span></div><div className="zenith-reading-meta"><span>ENGLISH + हिन्दी</span><span>VERIFIED SOURCES</span><span>GS MAPPING</span></div></div>
        </div>
      </section>

      <section className="zenith-section constellation-section" id="constellation">
        <div className="zenith-section-heading"><div><span className="zenith-kicker">THE KNOWLEDGE ATLAS / 02</span><h2>See the whole. Find your next idea.</h2><p>Explore a connected preview of the General Studies knowledge map. Select a domain to reveal its learning territory.</p></div><span className="zenith-index">GS / CORE</span></div>
        <div className="zenith-constellation-shell">
          <div className="zenith-constellation-toolbar"><div><span className="zenith-live-dot" /> KNOWLEDGE MAP PREVIEW</div><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a subject or theme" aria-label="Find a subject or theme" /></label></div>
          <div className="zenith-constellation-grid">
            <div className="zenith-topic-list">{filteredTopics.map((topic) => <button key={topic.id} className={activeTopic === topic.id ? `selected ${topic.tone}` : ""} onClick={() => setActiveTopic(topic.id)}><span>{topic.code}</span><b>{topic.name}</b><ArrowRight size={15} /></button>)}{filteredTopics.length === 0 && <p className="zenith-empty">No matching domain. Try another keyword.</p>}</div>
            <div className="zenith-topic-detail">{(() => { const topic = constellation.find((item) => item.id === activeTopic) ?? constellation[0]; return <><span className="zenith-kicker">{topic.code} / KNOWLEDGE DOMAIN</span><h3>{topic.name}</h3><p>A connected path across core concepts, current developments, previous-year questions and answer-writing practice.</p><div className="zenith-topic-tags">{topic.topics.split(" · ").map((tag) => <span key={tag}>{tag}</span>)}</div><div className="zenith-topic-footer"><span>FOUNDATION → APPLICATION → REVISION</span><a href="/onboarding/1">Explore learning path <ArrowRight size={14} /></a></div></>; })()}</div>
          </div>
        </div>
      </section>

      <footer className="zenith-footer"><a className="zenith-brand" href="/"><span className="zenith-brand-mark"><Layers3 size={18} /></span><span><strong>CivilPrep</strong><small>UPSC · PCS · BEYOND</small></span></a><p>Built for depth. Designed for clarity.</p><span>© CivilPrep IAS</span></footer>
    </main>
  );
}
