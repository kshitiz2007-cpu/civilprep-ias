"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, BookMarked, BookOpen, ChevronRight,
  Compass, FileText, Landmark, Library, Menu, MoveUpRight, PenLine,
  Search, Shield, Sparkles, X
} from "lucide-react";
import DailyContentCarousel from "@/components/DailyContentCarousel";
import "./prototype.css";

const territories = [
  { id: "polity", no: "01", name: "The Republic", sub: "Polity & Governance", detail: "Constitution, institutions, rights and the working of the Indian state.", topics: ["Constitutional morality", "Federal relations", "Parliamentary accountability"] },
  { id: "history", no: "02", name: "The Archive", sub: "History & Culture", detail: "Ideas, movements, material culture and the making of modern India.", topics: ["Reform movements", "Architecture & patronage", "National movement"] },
  { id: "economy", no: "03", name: "The Ledger", sub: "Economy", detail: "Public finance, growth, inclusion and the institutions shaping markets.", topics: ["Fiscal federalism", "Employment", "External sector"] },
  { id: "environment", no: "04", name: "The Fieldbook", sub: "Environment", detail: "Ecology, climate, conservation and the geography of risk.", topics: ["Biodiversity governance", "Climate adaptation", "Environmental impact"] },
  { id: "science", no: "05", name: "The Observatory", sub: "Science & Technology", detail: "Emerging science, strategic technologies and their public consequences.", topics: ["Space applications", "Semiconductors", "AI governance"] },
];

export default function StudentStudioPrototypePage() {
  const [active, setActive] = useState(territories[0]);
  const [selectedTopic, setSelectedTopic] = useState(territories[0].topics[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="atelier">
      <header className="at-header">
        <Link href="/dashboard" className="at-wordmark" aria-label="CivilPrep home">
          <span className="at-seal"><Landmark size={20}/></span>
          <span><b>CIVILPREP</b><small>THE CIVIL SERVICES ATELIER</small></span>
        </Link>
        <nav className={menuOpen ? "at-nav is-open" : "at-nav"}>
          <a href="#dispatch" onClick={() => setMenuOpen(false)}>Dispatch</a>
          <a href="#atlas" onClick={() => setMenuOpen(false)}>Knowledge atlas</a>
          <a href="#daily" onClick={() => setMenuOpen(false)}>Daily practice</a>
          <Link href="/resources">Library <MoveUpRight size={12}/></Link>
        </nav>
        <div className="at-header-end">
          <button className="at-search" aria-label="Search"><Search size={17}/></button>
          <Link href="/dashboard" className="at-profile">STUDY ROOM <ArrowRight size={14}/></Link>
          <button className="at-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
        </div>
      </header>

      <div className="at-masthead">
        <span>AN INSTITUTION FOR SERIOUS PREPARATION</span>
        <span>VOL. 01 <i/> INDIA</span>
      </div>

      <section className="at-hero" id="dispatch">
        <div className="at-hero-copy">
          <div className="at-kicker"><span className="at-kicker-line"/> THE DAILY DISPATCH <span>14 NOVEMBER 2026</span></div>
          <p className="at-hero-index">01 / IDEAS THAT SHAPE THE REPUBLIC</p>
          <h1>Learn to see<br/>the <em>whole</em><br/>picture.</h1>
          <p className="at-hero-deck">A considered space for the curious mind — where constitutional ideas, public policy and the everyday work of preparation meet.</p>
          <div className="at-hero-actions">
            <a href="#daily" className="at-button-dark">Enter today's edition <ArrowRight size={16}/></a>
            <a href="#atlas" className="at-text-link">Explore the atlas <ArrowDownRight size={16}/></a>
          </div>
          <div className="at-hero-foot"><span>PREPARE WITH INTENT</span><span>READ · QUESTION · REASON</span></div>
        </div>
        <div className="at-hero-art" aria-label="Architectural illustration of the Indian Parliament">
          <div className="at-art-top"><span>FIG. 01</span><span>THE INSTITUTIONAL LANDSCAPE</span></div>
          <div className="at-architecture">
            <div className="at-sun"/>
            <div className="at-arch-grid"/>
            <div className="at-building">
              <div className="at-dome"><i/><b/></div>
              <div className="at-roof"/>
              <div className="at-columns">{Array.from({length:13},(_,i)=><i key={i}/>)}</div>
              <div className="at-plinth"/>
            </div>
            <div className="at-contour contour-one"/><div className="at-contour contour-two"/>
            <span className="at-art-coordinate">28°37' N<br/>77°12' E</span>
          </div>
          <div className="at-art-caption"><span>THE REPUBLIC</span><span>AN ONGOING STUDY OF INSTITUTIONS</span></div>
        </div>
      </section>

      <section className="at-reading-line">
        <span className="at-reading-label"><Sparkles size={14}/> THE EDITOR'S NOTE</span>
        <p>Preparation is not the accumulation of facts. It is the patient construction of perspective.</p>
        <span className="at-reading-mark">GK / 01</span>
      </section>

      <section className="at-atlas-section" id="atlas">
        <div className="at-section-head">
          <div><span className="at-overline">A MAP OF WHAT MATTERS</span><h2>The knowledge<br/><em>atlas.</em></h2></div>
          <p>Five territories. Interconnected ideas. Move through a subject as you would explore a living map — follow a question, trace its context, find its connections.</p>
        </div>
        <div className="at-atlas">
          <div className="at-atlas-list" role="tablist" aria-label="Knowledge territories">
            {territories.map((item) => <button key={item.id} role="tab" aria-selected={active.id===item.id} className={active.id===item.id?"at-territory active":"at-territory"} onClick={()=>setActive(item)}>
              <span className="at-territory-no">{item.no}</span><span className="at-territory-name"><b>{item.name}</b><small>{item.sub}</small></span><ChevronRight size={17}/>
            </button>)}
          </div>
          <div className="at-atlas-detail">
            <div className="at-atlas-detail-top"><span>SELECTED TERRITORY / {active.no}</span><Compass size={18}/></div>
            <div className="at-atlas-glyph"><div className="at-glyph-ring ring-a"/><div className="at-glyph-ring ring-b"/><div className="at-glyph-cross"/><Landmark size={42}/><span>{active.no}</span></div>
            <span className="at-overline">{active.sub}</span>
            <h3>{active.name}</h3>
            <p>{active.detail}</p>
            <div className="at-topic-label">PATHWAYS TO EXPLORE</div>
            <div className="at-topic-list">{active.topics.map((topic,i)=><button key={topic} className={selectedTopic===topic?"is-selected":""} onClick={()=>setSelectedTopic(topic)}><span>0{i+1}</span>{topic}<ArrowUpRightIcon/></button>)}</div>
            <div className="at-path-note"><span>SELECTED LINE OF INQUIRY</span><strong>{selectedTopic}</strong><p>Trace the constitutional idea, identify the institution involved, then test how the principle works in a real governance situation.</p><div><Link href="/resources">Read related notes <ArrowRight size={13}/></Link><Link href="/quizzes">Test your understanding <ArrowRight size={13}/></Link></div></div>
          </div>
        </div>
      </section>

      <section className="at-daily-section" id="daily">
        <div className="at-daily-heading"><div><span className="at-overline">A SMALL RITUAL, EVERY DAY</span><h2>The daily <em>folio.</em></h2></div><p>One idea to understand. One question to frame. One answer to test.</p></div>
        <DailyContentCarousel/>
      </section>

      <section className="at-study-strip">
        <div><span className="at-overline">YOUR WORKING DESK</span><h2>Keep the thread.</h2><p>Move from reading to reasoning without losing the trail.</p></div>
        <Link href="/quizzes"><span className="at-strip-icon"><PenLine size={20}/></span><span><b>Practice room</b><small>Tests, drills and evaluation</small></span><ArrowRight size={17}/></Link>
        <Link href="/resources"><span className="at-strip-icon"><Library size={20}/></span><span><b>Reading archive</b><small>Notes, papers and resources</small></span><ArrowRight size={17}/></Link>
        <Link href="/history"><span className="at-strip-icon"><BookMarked size={20}/></span><span><b>Your record</b><small>Return to previous work</small></span><ArrowRight size={17}/></Link>
      </section>

      <footer className="at-footer"><Link href="/dashboard" className="at-footer-brand">CIVILPREP<span> / GYANKUNJ IAS</span></Link><span>THE WORK OF UNDERSTANDING NEVER ENDS.</span><a href="#dispatch">BACK TO TOP ↑</a></footer>
    </main>
  );
}

function ArrowUpRightIcon(){ return <ArrowRight size={14}/>; }
