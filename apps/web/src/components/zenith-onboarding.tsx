"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, GraduationCap, Languages, Target } from "lucide-react";
import "./zenith-onboarding.css";

const examOptions = [{ id: "upsc", label: "UPSC CSE", detail: "Civil Services Examination" }, { id: "mppsc", label: "MPPSC", detail: "Madhya Pradesh State Services" }, { id: "state-pcs", label: "Other State PCS", detail: "State public service examinations" }];
const languageOptions = [{ id: "bi", label: "Hindi + English", detail: "Bilingual learning experience" }, { id: "hi", label: "हिन्दी", detail: "हिन्दी प्राथमिकता" }, { id: "en", label: "English", detail: "English-first experience" }];
const focusOptions = [{ id: "foundation", label: "Build my foundation", detail: "Concepts, syllabus and core reading" }, { id: "current-affairs", label: "Connect current affairs", detail: "News, context and analysis" }, { id: "mains", label: "Improve answer writing", detail: "Structure, arguments and evaluation" }, { id: "practice", label: "Practice consistently", detail: "Daily drills, PYQs and tests" }];

export function ZenithOnboarding({ initialStep = 1 }: { initialStep?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(Math.min(3, Math.max(1, initialStep)));
  const [exam, setExam] = useState("upsc");
  const [language, setLanguage] = useState("bi");
  const [focus, setFocus] = useState("foundation");
  const [saved, setSaved] = useState(false);

  const finish = () => {
    const profile = { exam, language, focus, completedAt: new Date().toISOString() };
    try { window.localStorage.setItem("civilprep-onboarding-preview", JSON.stringify(profile)); } catch { /* local preview remains usable */ }
    setSaved(true);
    router.push("/app");
  };

  const groups = step === 1 ? examOptions : step === 2 ? languageOptions : focusOptions;
  const selected = step === 1 ? exam : step === 2 ? language : focus;
  const choose = (value: string) => step === 1 ? setExam(value) : step === 2 ? setLanguage(value) : setFocus(value);

  return <main className="zenith-onboarding"><header><a href="/" className="zenith-onboard-brand"><span>CP</span><b>CivilPrep</b></a><span>YOUR LEARNING SANCTUARY</span></header><div className="zenith-onboard-wrap"><div className="zenith-onboard-progress"><span>PERSONALISE YOUR SPACE</span><b>0{step} <i>/ 03</i></b><div><span style={{ width: `${step / 3 * 100}%` }} /></div></div><section className="zenith-onboard-card"><div className="zenith-onboard-icon">{step === 1 ? <GraduationCap /> : step === 2 ? <Languages /> : <Target />}</div><span className="zenith-kicker">STEP 0{step} / 03</span><h1>{step === 1 ? "What are you preparing for?" : step === 2 ? "Choose your reading language." : "What would you like to focus on first?"}</h1><p>{step === 1 ? "We will connect your study space to the right syllabus and examination structure." : step === 2 ? "Your preference shapes the reading experience. You can change it any time." : "Choose a starting point. Your learning path can evolve as you progress."}</p><div className="zenith-onboard-options">{groups.map((option) => <button key={option.id} type="button" className={selected === option.id ? "selected" : ""} onClick={() => choose(option.id)}><span className="zenith-option-copy"><b>{option.label}</b><small>{option.detail}</small></span><span className="zenith-option-check">{selected === option.id && <Check size={14} />}</span></button>)}</div><div className="zenith-onboard-actions">{step > 1 ? <button className="zenith-onboard-back" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={15} /> Back</button> : <a className="zenith-onboard-back" href="/">Return home</a>}{step < 3 ? <button className="zenith-onboard-next" onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={15} /></button> : <button className="zenith-onboard-next" onClick={finish}>Enter my learning space <ArrowRight size={15} /></button>}</div></section><p className="zenith-onboard-foot"><BookOpen size={14} /> This is a local preview setup. Your choices are stored on this device only.</p></div></main>;
}
