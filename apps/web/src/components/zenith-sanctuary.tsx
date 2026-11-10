"use client";
import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Notification03Icon, SearchIcon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { ZenithThemeControl } from "./zenith-theme-provider";
import "./zenith-sanctuary.css";

const editorialLayers = [
 {id:"surface",label:"The signal",title:"What happened?",body:"A concise, bilingual brief that separates the event from the noise.",detail:"Start with the verified development, the institution involved, the date, and the primary source.",icon:Notification03Icon},
 {id:"context",label:"The context",title:"Why does it matter?",body:"Constitutional, historical, economic and institutional context in one connected reading path.",detail:"Trace constitutional provisions, committee recommendations, policy decisions and linked syllabus themes.",icon:Home01Icon},
 {id:"analysis",label:"The lens",title:"What should an aspirant think?",body:"Arguments, counterpoints and a mains-ready analytical frame—not a pre-written opinion.",detail:"Build a balanced position with stakeholders, implementation gaps, federal dimensions, ethical questions and a practical way forward.",icon:Settings01Icon},
] as const;
const constellation=[
 {id:"polity",code:"GS II",name:"Polity & Governance",topics:"Constitution · Parliament · Federalism",tone:"sage",icon:Home01Icon},
 {id:"economy",code:"GS III",name:"Economy",topics:"Growth · Inclusion · Public finance",tone:"clay",icon:Settings01Icon},
 {id:"history",code:"GS I",name:"History & Society",topics:"Modern India · Culture · Social change",tone:"indigo",icon:Notification03Icon},
 {id:"ethics",code:"GS IV",name:"Ethics & Integrity",topics:"Thinkers · Case studies · Aptitude",tone:"sand",icon:UserIcon},
] as const;
type SanctuaryIcon = typeof Home01Icon | typeof Notification03Icon | typeof SearchIcon | typeof Settings01Icon | typeof UserIcon;\nfunction Icon({icon,size=20}:{icon:SanctuaryIcon;size?:number}){return <HugeiconsIcon icon={icon} size={size} color="currentColor" strokeWidth={1.65} aria-hidden="true"/>}

export function ZenithSanctuary(){
 const [layer,setLayer]=useState<(typeof editorialLayers)[number]["id"]>("surface");
 const [activeTopic,setActiveTopic]=useState("polity");
 const [query,setQuery]=useState("");
 const currentLayer=editorialLayers.find(item=>item.id===layer)??editorialLayers[0];
 const currentTopic=constellation.find(item=>item.id===activeTopic)??constellation[0];
 const filteredTopics=useMemo(()=>constellation.filter(item=>`${item.name} ${item.topics} ${item.code}`.toLowerCase().includes(query.toLowerCase())),[query]);
 return <main className="zenith-page">
  <header className="zenith-nav">
   <a className="zenith-brand" href="/" aria-label="CivilPrep home"><span className="zenith-brand-mark"><Icon icon={Home01Icon} size={21}/></span><span><strong>CivilPrep</strong><small>THE KNOWLEDGE SANCTUARY</small></span></a>
   <nav aria-label="Main navigation" className="zenith-nav-links"><a href="#editorial">Editorial Lens</a><a href="#constellation">Syllabus Map</a><a href="#principles">Our method</a></nav>
   <div className="zenith-nav-actions"><ZenithThemeControl/><a className="zenith-login" href="/login">Sign in <span aria-hidden="true">↗</span></a></div>
  </header>
  <section className="zenith-hero">
   <div className="zenith-hero-copy">
    <div className="zenith-overline"><span/> A calmer way to prepare for what matters</div>
    <h1>Knowledge is not<br/>a pile. <em>It connects.</em></h1>
    <p>One knowledge identity. Multiple learning experiences. A living study space for UPSC and State PCS—built to help you understand deeply, connect ideas and write with clarity.</p>
    <div className="zenith-hero-actions"><a className="zenith-primary" href="/onboarding/1">Enter your sanctuary <span aria-hidden="true">↗</span></a><a className="zenith-secondary" href="#constellation">Explore the knowledge map <span aria-hidden="true">↓</span></a></div>
    <div className="zenith-proof"><span><Icon icon={Notification03Icon} size={16}/> Bilingual by design</span><span><Icon icon={Home01Icon} size={16}/> Syllabus-connected</span><span><Icon icon={Settings01Icon} size={16}/> Built for understanding</span></div>
   </div>
   <div className="zenith-knowledge-map" aria-label="Connected learning pathways">
    <div className="zenith-map-heading"><span>THE CIVILPREP KNOWLEDGE GRAPH</span><b>Ideas in relation.</b></div>
    <div className="zenith-map-lines" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div className="zenith-map-core"><span>CP</span><small>ONE CONNECTED<br/>KNOWLEDGE SPACE</small></div>
    <div className="zenith-map-card map-card-one"><span className="map-card-icon sage"><Icon icon={Home01Icon} size={19}/></span><div><small>01 / FOUNDATION</small><b>Syllabus</b></div><span className="map-card-arrow">↗</span></div>
    <div className="zenith-map-card map-card-two"><span className="map-card-icon clay"><Icon icon={Notification03Icon} size={19}/></span><div><small>02 / PERSPECTIVE</small><b>Editorials</b></div><span className="map-card-arrow">↗</span></div>
    <div className="zenith-map-card map-card-three"><span className="map-card-icon indigo"><Icon icon={Settings01Icon} size={19}/></span><div><small>03 / APPLICATION</small><b>Practice</b></div><span className="map-card-arrow">↗</span></div>
    <div className="zenith-map-card map-card-four"><span className="map-card-icon sand"><Icon icon={UserIcon} size={19}/></span><div><small>04 / RETENTION</small><b>Revision</b></div><span className="map-card-arrow">↗</span></div>
    <div className="zenith-map-caption">A map, not a maze.</div>
   </div>
  </section>
  <section className="zenith-principles" id="principles">
   <div><span>01 / CONNECTED</span><b>Every idea has a place.</b><small>Topics, editorials, PYQs and notes share one canonical identity.</small></div>
   <div><span>02 / CONTEXTUAL</span><b>Every fact has a why.</b><small>Move from the news signal to context, then to critical analysis.</small></div>
   <div><span>03 / PERSONAL</span><b>Your learning has a rhythm.</b><small>A calm study environment that adapts to your time and preference.</small></div>
  </section>
  <section className="zenith-section" id="editorial">
   <div className="zenith-section-heading"><div><span className="zenith-kicker">THE EDITORIAL LENS / 01</span><h2>Read beyond<br/><em>the headline.</em></h2><p>Three depths. One coherent understanding. Explore how a current issue becomes a useful learning asset.</p></div><span className="zenith-index">01 — 03</span></div>
   <div className="zenith-editorial-card">
    <div className="zenith-layer-list" role="tablist" aria-label="Editorial reading depth">{editorialLayers.map((item,index)=><button key={item.id} type="button" role="tab" aria-selected={layer===item.id} className={layer===item.id?"active":""} onClick={()=>setLayer(item.id)}><span>0{index+1}</span><b>{item.label}</b><span className="tab-arrow">↗</span></button>)}</div>
    <div className="zenith-layer-content" role="tabpanel"><span className="zenith-kicker">A THREE-DEPTH READING MODEL</span><h3>{currentLayer.title}</h3><p>{currentLayer.body}</p><div className="zenith-layer-detail"><Icon icon={currentLayer.icon} size={19}/><span>{currentLayer.detail}</span></div><div className="zenith-reading-meta"><span>ENGLISH + हिन्दी</span><span>VERIFIED SOURCES</span><span>GS MAPPING</span></div></div>
   </div>
  </section>
  <section className="zenith-section constellation-section" id="constellation">
   <div className="zenith-section-heading"><div><span className="zenith-kicker">THE SYLLABUS MAP / 02</span><h2>See the whole.<br/><em>Find your next idea.</em></h2><p>Explore a connected preview of the General Studies knowledge map. Select a domain to reveal its learning territory.</p></div><span className="zenith-index">GS / CORE</span></div>
   <div className="zenith-constellation-shell">
    <div className="zenith-constellation-toolbar"><div><span className="zenith-live-dot"/> KNOWLEDGE MAP PREVIEW</div><label><Icon icon={SearchIcon} size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a subject or theme" aria-label="Find a subject or theme"/></label></div>
    <div className="zenith-constellation-grid">
     <div className="zenith-topic-list">{filteredTopics.map(topic=><button key={topic.id} className={activeTopic===topic.id?`selected ${topic.tone}`:""} onClick={()=>setActiveTopic(topic.id)}><span>{topic.code}</span><b>{topic.name}</b><Icon icon={topic.icon} size={17}/></button>)}{filteredTopics.length===0&&<p className="zenith-empty">No matching domain. Try another keyword.</p>}</div>
     <div className="zenith-topic-detail"><span className="zenith-kicker">{currentTopic.code} / KNOWLEDGE DOMAIN</span><div className="zenith-topic-title"><span className={`topic-icon ${currentTopic.tone}`}><Icon icon={currentTopic.icon} size={25}/></span><h3>{currentTopic.name}</h3></div><p>A connected path across core concepts, current developments, previous-year questions and answer-writing practice.</p><div className="zenith-topic-tags">{currentTopic.topics.split(" · ").map(tag=><span key={tag}>{tag}</span>)}</div><div className="zenith-topic-footer"><span>FOUNDATION → APPLICATION → REVISION</span><a href="/onboarding/1">Explore learning path <span aria-hidden="true">↗</span></a></div></div>
    </div>
   </div>
  </section>
  <footer className="zenith-footer"><a className="zenith-brand" href="/"><span className="zenith-brand-mark"><Icon icon={Home01Icon} size={18}/></span><span><strong>CivilPrep</strong><small>UPSC · PCS · BEYOND</small></span></a><p>Built for depth. Designed for clarity.</p><span>© CivilPrep IAS</span></footer>
 </main>;
}
