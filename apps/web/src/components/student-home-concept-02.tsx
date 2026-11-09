"use client";

import { useState } from "react";
import {
  ArrowDownRight, ArrowRight, BookOpen, Bookmark, CalendarDays, Check,
  ChevronRight, Clock3, Compass, Flame, Globe2, Layers3, ListChecks,
  NotebookPen, Play, Sparkles, Target, Trophy
} from "lucide-react";

const tasks = [
  { id: "rights", title: "Revise Fundamental Rights", meta: "POLITY · 25 MIN", time: "TODAY" },
  { id: "drill", title: "Attempt Daily Drill", meta: "CURRENT AFFAIRS · 15 Q", time: "15 MIN" },
  { id: "mains", title: "Write one GS-II answer", meta: "GOVERNANCE · 150 WORDS", time: "MAINS" },
];

const subjects = [
  { name: "Polity & Governance", value: 82, color: "sage", code: "01" },
  { name: "Economy", value: 68, color: "terracotta", code: "02" },
  { name: "History & Culture", value: 74, color: "indigo", code: "03" },
  { name: "Geography", value: 61, color: "saffron", code: "04" },
];

const paths = [
  { code: "GS II", title: "Fundamental Rights", note: "PART III · ARTICLES 12–35", progress: 64, color: "sage" },
  { code: "GS I", title: "The making of modern India", note: "HISTORY · 1857–1947", progress: 38, color: "terracotta" },
  { code: "GS III", title: "India’s monsoon system", note: "GEOGRAPHY · CLIMATE", progress: 21, color: "indigo" },
];

function IndiaMark() {
  return <svg viewBox="0 0 240 210" role="img" aria-label="Abstract Indian cartographic motif" className="cc-india-mark">
    <path d="M104 12 133 27 149 48 170 55 164 76 182 93 164 111 155 135 137 145 127 169 108 196 93 178 85 153 66 138 72 117 54 99 68 81 62 61 83 48 86 29Z" fill="none" stroke="currentColor" strokeWidth="2.2"/>
    <path d="M104 12 133 27 149 48 170 55M68 81 164 76 182 93M54 99 164 111 155 135M72 117 137 145 127 169M85 153 108 196" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".6"/>
    <circle cx="104" cy="82" r="7" fill="currentColor"/><circle cx="137" cy="145" r="5" fill="currentColor"/><circle cx="85" cy="153" r="4" fill="currentColor"/>
    <path d="M16 182h55M24 192h38M178 28h42M190 38h30" stroke="currentColor" strokeWidth="2"/>
    <text x="16" y="20" fill="currentColor" fontSize="9" letterSpacing="2">INDIA / 01</text>
  </svg>;
}

export function StudentHomeConcept02() {
  const [done, setDone] = useState<string[]>([]);
  const [activePath, setActivePath] = useState(0);
  const [saved, setSaved] = useState(false);
  const toggle = (id: string) => setDone(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  return <main className="cc-home">
    <div className="cc-home-meta"><span><i/> YOUR PREPARATION / 09 NOVEMBER 2026</span><span>UPSC CSE · 2027</span></div>
    <section className="cc-opening">
      <div className="cc-opening-copy">
        <span className="cc-kicker">A PERSONAL LEARNING ATLAS <b>01—04</b></span>
        <h2>Make knowledge<br/><em>move.</em></h2>
        <p>Good preparation is not a pile of notes. It is a map of ideas, connections and deliberate practice.</p>
        <div className="cc-opening-actions"><a href="/app/plan" className="cc-primary">Open my plan <ArrowRight size={16}/></a><a href="/app/discover" className="cc-text-link">Explore the atlas <ArrowDownRight size={16}/></a></div>
        <div className="cc-streak"><Flame size={17}/><b>12</b><span>DAY STREAK</span><i/><Clock3 size={16}/><b>2h 40m</b><span>THIS WEEK</span></div>
      </div>
      <div className="cc-opening-art"><div className="cc-art-orbit cc-orbit-one"/><div className="cc-art-orbit cc-orbit-two"/><div className="cc-sun"/><IndiaMark/><span className="cc-art-note">ज्ञान / विवेक / सेवा</span><span className="cc-art-index">BHARAT · 26°N</span></div>
      <div className="cc-vertical-note">LEARN WITH INTENTION · 2026—27</div>
    </section>

    <section className="cc-signal-row" aria-label="Learning indicators">
      <div className="cc-signal cc-signal-major"><span className="cc-kicker">PREPARATION PULSE</span><strong>72<small>%</small></strong><div className="cc-signal-foot"><span>+4% THIS MONTH</span><span className="cc-sparkline">╱╲╱╱╲╱╱</span></div></div>
      <div className="cc-signal"><span className="cc-kicker">TESTS ATTEMPTED</span><strong>48</strong><span className="cc-signal-foot">06 THIS MONTH</span></div>
      <div className="cc-signal"><span className="cc-kicker">MAINS AVERAGE</span><strong>12.8<small>/20</small></strong><span className="cc-signal-foot">+1.2 IMPROVEMENT</span></div>
      <div className="cc-signal cc-signal-last"><span className="cc-kicker">PERSONAL BEST</span><strong>18<small> days</small></strong><span className="cc-signal-foot">STREAK RECORD</span></div>
    </section>

    <section className="cc-today">
      <div className="cc-section-intro"><span className="cc-kicker">02 / THE DAY AHEAD</span><h3>Today's<br/><em>coordinates.</em></h3><p>Three purposeful moves. One more step forward.</p><a href="/app/plan">View full plan <ArrowRight size={14}/></a></div>
      <div className="cc-task-board">
        <div className="cc-task-head"><span>YOUR FIELD NOTES</span><span>{done.length.toString().padStart(2,"0")} / 03 COMPLETE</span></div>
        {tasks.map((task,index)=><label className={done.includes(task.id)?"cc-task cc-task-done":"cc-task"} key={task.id}>
          <input type="checkbox" checked={done.includes(task.id)} onChange={()=>toggle(task.id)}/>
          <span className="cc-task-check"><Check size={14}/></span><span className="cc-task-number">0{index+1}</span>
          <span className="cc-task-copy"><b>{task.title}</b><small>{task.meta}</small></span><span className="cc-task-time">{task.time}</span>
        </label>)}
        <div className="cc-task-progress"><span style={{width:(done.length/3*100)+"%"}}/></div>
      </div>
      <aside className="cc-day-aside"><CalendarDays size={21}/><span className="cc-kicker">MONDAY / WEEK 46</span><b>Consistency<br/>over intensity.</b><p>Small, repeated efforts compound into exam-ready understanding.</p><span className="cc-day-quote">“धीरे-धीरे रे मना…”</span></aside>
    </section>

    <section className="cc-learning-map">
      <div className="cc-map-heading"><div><span className="cc-kicker">03 / CONTINUE YOUR EXPLORATION</span><h3>Learning <em>pathways.</em></h3></div><a href="/app/library">All pathways <ArrowRight size={15}/></a></div>
      <div className="cc-path-layout">
        <div className="cc-path-list">{paths.map((path,index)=><button className={activePath===index?"cc-path-option active":"cc-path-option"} onClick={()=>setActivePath(index)} key={path.title}><span className="cc-path-code">{path.code}</span><span><b>{path.title}</b><small>{path.note}</small></span><ChevronRight size={17}/></button>)}</div>
        <div className={"cc-path-feature cc-"+paths[activePath].color}><div className="cc-feature-top"><span>SELECTED MODULE / 0{activePath+1}</span><button onClick={()=>setSaved(!saved)} aria-label="Save module"><Bookmark size={17} fill={saved?"currentColor":"none"}/></button></div><span className="cc-feature-code">{paths[activePath].code}</span><h4>{paths[activePath].title}</h4><p>{paths[activePath].note}</p><div className="cc-feature-progress"><span style={{width:paths[activePath].progress+"%"}}/></div><div className="cc-feature-bottom"><span>{paths[activePath].progress}% EXPLORED</span><a href="/app/library">Resume module <ArrowRight size={15}/></a></div><div className="cc-feature-decoration">ज्ञान</div></div>
      </div>
    </section>

    <section className="cc-subjects">
      <div className="cc-subject-heading"><span className="cc-kicker">04 / YOUR KNOWLEDGE TERRITORY</span><h3>See the whole <em>landscape.</em></h3><p>Progress across the subjects that shape your preparation.</p></div>
      <div className="cc-subject-grid">{subjects.map(subject=><div className={"cc-subject cc-subject-"+subject.color} key={subject.name}><span className="cc-subject-code">{subject.code}</span><b>{subject.name}</b><strong>{subject.value}<small>%</small></strong><div className="cc-subject-track"><span style={{width:subject.value+"%"}}/></div></div>)}</div>
    </section>

    <section className="cc-explore"><div className="cc-explore-lead"><span className="cc-kicker">05 / KNOWLEDGE IN MOTION</span><h3>Choose your<br/><em>next direction.</em></h3></div><a href="/app/practice/daily-drill"><Target/><b>Daily Drill</b><small>Test today's understanding</small><ArrowRight className="cc-explore-arrow"/></a><a href="/app/current-affairs"><Globe2/><b>Daily Crux</b><small>Connect news with concepts</small><ArrowRight className="cc-explore-arrow"/></a><a href="/app/mains"><NotebookPen/><b>Mains Studio</b><small>Turn ideas into answers</small><ArrowRight className="cc-explore-arrow"/></a></section>
    <footer className="cc-home-footer"><span>CIVILPREP IAS / PREPARE WITH PERSPECTIVE</span><span>सीखना · समझना · आगे बढ़ना</span><span>YOUR JOURNEY, IN YOUR HANDS ↗</span></footer>
  </main>;
}
