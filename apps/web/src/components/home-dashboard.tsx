"use client";

import {
  Activity, Bell, BookOpen, Bookmark, CalendarDays, ChartNoAxesColumnIncreasing,
  CheckCircle2, ChevronRight, Clock3, Compass, FileText, Flame, GraduationCap,
  House, Layers3, LibraryBig, ListChecks, Search, Target, Trophy, Video,
} from "lucide-react";

const nav = [
  { label: "Home", icon: House, active: true },
  { label: "My Plan", icon: CalendarDays },
  { label: "Discover", icon: Compass },
  { label: "Learn", icon: BookOpen },
  { label: "Practice", icon: Target },
  { label: "Tests", icon: ListChecks },
  { label: "Mains Studio", icon: FileText },
  { label: "Revision", icon: Layers3 },
  { label: "Performance", icon: ChartNoAxesColumnIncreasing },
  { label: "Classroom", icon: Video },
  { label: "Resource Centre", icon: LibraryBig },
];

const tasks = [
  { title: "Revise Fundamental Rights", detail: "Polity · 25 minutes", tag: "Due today", tone: "orange" },
  { title: "Attempt Daily Drill", detail: "Current Affairs · 15 questions", tag: "15 min", tone: "green" },
  { title: "Write one GS-II answer", detail: "Governance · 150 words", tag: "Mains", tone: "purple" },
];

const subjects = [
  { name: "Polity & Governance", value: 82, color: "green" },
  { name: "Economy", value: 68, color: "orange" },
  { name: "History & Culture", value: 74, color: "purple" },
  { name: "Geography", value: 61, color: "green" },
];

function ParliamentIllustration() {
  return (
    <svg viewBox="0 0 360 150" role="img" aria-label="Illustration of an Indian public institution" className="parliament-art">
      <path d="M0 137h360" stroke="#b7a58e" strokeWidth="2" />
      <path d="M72 73 180 25l108 48H72Z" fill="#d98a4c" />
      <path d="M88 76h184v8H88z" fill="#b95a2b" />
      <path d="M99 84h162v42H99z" fill="#f3d8b5" />
      {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${110 + i * 24} 88v35`} stroke="#9a6c4b" strokeWidth="5" />)}
      <path d="M155 25a25 25 0 0 1 50 0v-8h-50z" fill="#c66a35" />
      <path d="M177 0h5v18h-5z" fill="#a7b99a" />
      <path d="M182 3h24l-5 7h-19z" fill="#d56b32" />
      <path d="M48 137c16-32 30-43 48-46M315 137c-15-30-26-41-43-45" fill="none" stroke="#718b64" strokeWidth="5" strokeLinecap="round" />
      <circle cx="48" cy="87" r="21" fill="#a7b99a" /><circle cx="315" cy="88" r="23" fill="#91a883" />
      <path d="M0 139c55-10 92-4 130 0s84 7 125 0 70-5 105 0v11H0z" fill="#d9c7aa" />
    </svg>
  );
}

export function HomeDashboard() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">✦</span><span><strong>CivilPrep IAS</strong><small>UPSC • PCS • Beyond</small></span></a>
        <nav className="top-links" aria-label="Primary navigation">
          {["Home", "Discover", "Learn", "Practice", "Tests", "Mains Studio", "Revision", "Performance", "Classroom"].map((item) => <a key={item} className={item === "Home" ? "top-link active" : "top-link"} href="#">{item}</a>)}
        </nav>
        <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={18}/></button><button className="icon-button" aria-label="Notifications"><Bell size={18}/></button><span className="language">हिंदी⌄</span><div className="profile"><span className="avatar">K</span><span><b>Student</b><small>UPSC CSE 2027</small></span></div></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-heading"><span className="side-emblem"><GraduationCap size={23}/></span><div><b>Learning Space</b><small>Your preparation, organised</small></div></div>
          <div className="side-nav">{nav.map(({ label, icon: Icon, active }) => <a key={label} href="#" className={active ? "side-item selected" : "side-item"}><Icon size={18}/><span>{label}</span></a>)}</div>
          <section className="goal-card"><div className="goal-title"><Target size={23}/><b>Today's Focus</b></div><p>Build consistency, one focused session at a time.</p><div className="progress-track"><span style={{ width: "60%" }}/></div><small>3 of 5 tasks completed</small></section>
          <div className="side-art"><ParliamentIllustration/></div>
        </aside>

        <section className="main-content">
          <div className="welcome-banner">
            <div className="welcome-copy"><span className="eyebrow">UPSC CSE 2027 · YOUR LEARNING SPACE</span><h1>Welcome back.</h1><p>Make today count. Your next step is ready.</p><div className="banner-meta"><span><Flame size={15}/> 12 day study streak</span><span><Clock3 size={15}/> 2h 40m focused this week</span></div></div>
            <ParliamentIllustration/>
          </div>

          <div className="metric-grid">
            <article className="metric-card"><span className="metric-icon orange"><Activity/></span><div><small>Preparation progress</small><strong>72%</strong><em>+4% this month</em></div></article>
            <article className="metric-card"><span className="metric-icon green"><ListChecks/></span><div><small>Tests attempted</small><strong>48</strong><em>6 this month</em></div></article>
            <article className="metric-card"><span className="metric-icon purple"><FileText/></span><div><small>Average Mains score</small><strong>12.8/20</strong><em>+1.2 improvement</em></div></article>
            <article className="metric-card"><span className="metric-icon saffron"><Trophy/></span><div><small>Study streak</small><strong>12 days</strong><em>Personal best: 18</em></div></article>
          </div>

          <div className="content-grid">
            <section className="panel continue-panel"><div className="panel-heading"><div><span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Continue learning</h2></div><a href="#">View learning path <ChevronRight size={16}/></a></div><div className="continue-item"><div className="subject-art"><BookOpen size={31}/><span>GS II</span></div><div className="continue-info"><span className="pill pill-sage">POLITY & GOVERNANCE</span><h3>Fundamental Rights</h3><p>Part III · Articles 12–35 · Last opened yesterday</p><div className="progress-track"><span style={{ width: "64%" }}/></div><small>64% completed · 18 min remaining</small></div><button className="primary-button">Continue <ChevronRight size={16}/></button></div></section>

            <section className="panel today-panel"><div className="panel-heading"><div><span className="section-kicker">A CLEAR PLAN FOR TODAY</span><h2>Today's focus</h2></div><CalendarDays size={21}/></div><div className="task-list">{tasks.map((task) => <div className="task-row" key={task.title}><span className={`task-dot ${task.tone}`}/><div><b>{task.title}</b><small>{task.detail}</small></div><span className={`task-tag ${task.tone}`}>{task.tag}</span></div>)}</div><button className="text-button">Open daily plan <ChevronRight size={15}/></button></section>

            <section className="panel subject-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR KNOWLEDGE, IN MOTION</span><h2>Subject progress</h2></div><a href="#">All subjects <ChevronRight size={16}/></a></div><div className="subject-list">{subjects.map((subject) => <div className="subject-row" key={subject.name}><span>{subject.name}</span><div className="progress-track"><span className={subject.color} style={{ width: `${subject.value}%` }}/></div><b>{subject.value}%</b></div>)}</div></section>

            <section className="panel discovery-panel"><div className="panel-heading"><div><span className="section-kicker">EXPLORE WITH PURPOSE</span><h2>Knowledge discovery</h2></div><Compass size={21}/></div><div className="discovery-cards"><a href="#"><BookOpen/><b>Explore syllabus</b><small>UPSC & State PCS</small></a><a href="#"><Bookmark/><b>Saved resources</b><small>Your personal library</small></a><a href="#"><Video/><b>Upcoming classes</b><small>Learn with faculty</small></a></div></section>
          </div>
          <footer className="dashboard-footer"><span>सीखना • समझना • आगे बढ़ना</span><span>CivilPrep IAS · Prepare with perspective.</span></footer>
        </section>
      </div>
    </main>
  );
}
