import { ArrowRight, ArrowUpRight, Globe2, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ZenithThemeControl } from "./zenith-theme-provider";
import { GradientText } from "./react-bits/gradient-text";
import { MagicBento } from "./react-bits/magic-bento";
import { CircularCarousel } from "./react-bits/circular-carousel";
import { ScrollStack, ScrollStackItem } from "./react-bits/scroll-stack";

export function PublicHome() {
  return (
    <main className="rose-site">
      <header className="rose-nav">
        <a className="rose-brand" href="/" aria-label="CivilPrep IAS home">
          <BrandMark size={23}/>
          <span><b>CivilPrep</b><small>IAS · UPSC / PCS</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/our-approach">Our approach</a>
          <a href="/programs">Programs</a>
          <a href="/current-affairs">Current affairs</a>
          <a href="/resources">Knowledge library</a>
        </nav>
        <div className="rose-nav-actions">
          <ZenithThemeControl/><a className="rose-login" href="/login">Log in</a>
          <a className="rose-button rose-button-primary" href="/register">Begin your journey <ArrowUpRight size={16}/></a>
        </div>
        <a className="rose-mobile-menu" href="/programs" aria-label="Explore programs"><Menu size={21}/></a>
      </header>

      <section className="rose-hero">
        <div className="rose-hero-copy">
          <span className="rose-eyebrow"><i/> A MORE INTELLIGENT WAY TO PREPARE</span>
          <h1>Study with intent.<br/><GradientText>Think with depth.</GradientText></h1>
          <p className="rose-hero-lede">A connected learning environment for civil services aspirants. Build strong foundations, understand the world around you and turn knowledge into confident answers.</p>
          <div className="rose-hero-actions">
            <a className="rose-button rose-button-primary" href="/register">Explore your learning space <ArrowRight size={16}/></a>
            <a className="rose-button rose-button-quiet" href="/our-approach">Discover the approach</a>
          </div>
          <div className="rose-proof">
            <span><ShieldCheck size={15}/> Syllabus-led learning</span>
            <span><Globe2 size={15}/> Hindi + English</span>
            <span><Sparkles size={15}/> Learn, practise, improve</span>
          </div>
        </div>
        <div className="rose-hero-art" aria-label="Abstract rose-gold editorial illustration">
          <div className="rose-art-orbit orbit-one"/><div className="rose-art-orbit orbit-two"/>
          <div className="rose-art-disc"/>
          <div className="rose-art-book"><span/><i/><b/></div>
          <div className="rose-art-glass"/>
          <div className="rose-art-caption caption-top">KNOWLEDGE / 01</div>
          <div className="rose-art-caption caption-bottom">CLARITY IS A PRACTICE</div>
          <div className="rose-art-stamp">C<br/>P</div>
          <div className="rose-art-note"><small>THE CIVILPREP METHOD</small><b>Connect every idea.</b><span>From concept to context to application.</span></div>
        </div>
        <div className="rose-hero-index">01 — 04 <span>PREPARATION, REIMAGINED</span></div>
      </section>

      <section className="rose-intro">
        <div><span className="rose-section-label">THE CIVILPREP DIFFERENCE</span><h2>Preparation that changes<br/><GradientText>how you see the world.</GradientText></h2></div>
        <p>Competitive examinations reward more than recall. They demand perspective, judgement and the ability to connect knowledge with real-world developments. CivilPrep brings the entire learning journey into one coherent system.</p>
      </section>

      <section className="rose-section rose-capabilities">
        <div className="rose-section-heading"><div><span className="rose-section-label">A CONNECTED LEARNING ECOSYSTEM</span><h2>Every layer has a purpose.</h2></div><span className="rose-section-aside">01 / CAPABILITIES</span></div>
        <MagicBento/>
      </section>

      <section className="rose-section rose-subject-section">
        <div className="rose-section-heading"><div><span className="rose-section-label">THE KNOWLEDGE MAP</span><h2>Explore your world of ideas.</h2></div><span className="rose-section-aside">02 / SUBJECT DOMAINS</span></div>
        <CircularCarousel/>
      </section>

      <section className="rose-process">
        <div className="rose-process-heading"><span className="rose-section-label">A BETTER WAY TO MOVE FORWARD</span><h2>From first principles<br/>to <GradientText>confident application.</GradientText></h2><p>Progress is not a straight line. It is a thoughtful cycle of discovery, understanding, practice and reflection.</p></div>
        <ScrollStack className="rose-process-stack">
          <ScrollStackItem index={0}><span className="rb-stack-number">01</span><div><h3>Discover with direction.</h3><p>Make the syllabus navigable. Identify priorities, map concepts and know where each topic belongs in the larger picture.</p></div><span className="rb-stack-meta">ORIENT</span></ScrollStackItem>
          <ScrollStackItem index={1}><span className="rb-stack-number">02</span><div><h3>Understand the connections.</h3><p>Build durable foundations through structured explanations, current context, examples and bilingual learning resources.</p></div><span className="rb-stack-meta">UNDERSTAND</span></ScrollStackItem>
          <ScrollStackItem index={2}><span className="rb-stack-number">03</span><div><h3>Practise with precision.</h3><p>Apply what you know through daily drills, previous-year questions, full-length tests and guided answer writing.</p></div><span className="rb-stack-meta">APPLY</span></ScrollStackItem>
          <ScrollStackItem index={3}><span className="rb-stack-number">04</span><div><h3>Reflect. Refine. Repeat.</h3><p>Use meaningful feedback to understand gaps, strengthen weak areas and make each next study session more intentional.</p></div><span className="rb-stack-meta">IMPROVE</span></ScrollStackItem>
        </ScrollStack>
      </section>

      <section className="rose-editorial">
        <div className="rose-editorial-index">03 / PERSPECTIVE</div>
        <div><span className="rose-section-label">CURRENT AFFAIRS, WITH CONTEXT</span><h2>Go beyond<br/>the headline.</h2><p>Understand the institutions, constitutional values, competing interests and long-term implications behind the news that matters.</p><a className="rose-editorial-link" href="/current-affairs">Explore Daily Crux <ArrowUpRight size={16}/></a></div>
        <div className="rose-editorial-seal">READ<br/>THINK<br/>CONNECT</div>
      </section>

      <section className="rose-enrol">
        <div><span className="rose-section-label">YOUR NEXT CHAPTER STARTS HERE</span><h2>Prepare with clarity.<br/><GradientText>Progress with purpose.</GradientText></h2><p>Bring your preparation into focus with a learning space designed around the way civil services aspirants actually learn.</p></div>
        <a className="rose-button rose-button-primary" href="/register">Create your learning space <ArrowRight size={16}/></a>
      </section>

      <footer className="rose-footer">
        <a className="rose-brand" href="/"><BrandMark size={21}/><span><b>CivilPrep</b><small>IAS · UPSC / PCS</small></span></a>
        <p>Thoughtful preparation for a changing India.</p>
        <div><a href="/about">About</a><a href="/help">Help</a><a href="/contact">Contact</a><a href="/pricing">Pricing</a></div>
        <small>© 2026 CivilPrep IAS · Learn with perspective.</small>
      </footer>
    </main>
  );
}
