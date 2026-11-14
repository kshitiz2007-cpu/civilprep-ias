'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleCheck, CircleX, FileQuestion, Lightbulb, Loader2, RotateCcw, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export type DailyContentType = 'topic' | 'question' | 'mcq';
export interface DailyContentItem {
  id: string;
  content_type: DailyContentType;
  publish_date: string;
  title: string;
  body: string;
  options: string[];
  correct_option: number | null;
  explanation: string | null;
  image_paths: string[];
  pdf_paths: string[];
}
const SLIDES: { type: DailyContentType; label: string; eyebrow: string; icon: typeof BookOpen }[] = [
  { type: 'topic', label: 'Topic', eyebrow: 'Topic of the day', icon: BookOpen },
  { type: 'question', label: 'Question', eyebrow: 'Question of the day', icon: Lightbulb },
  { type: 'mcq', label: 'MCQ', eyebrow: 'MCQ of the day', icon: FileQuestion },
];
function localDateKey() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export default function DailyContentCarousel() {
  const router = useRouter();
  const [items, setItems] = useState<Partial<Record<DailyContentType, DailyContentItem>>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const activeSlide = SLIDES[activeIndex];
  const activeItem = items[activeSlide.type];

  useEffect(() => {
    let active = true;
    const today = localDateKey();
    async function loadItems() {
      setLoading(true);
      const { data, error } = await supabase.from('daily_carousel_content').select('*').eq('publish_date', today);
      if (!active) return;
      if (error) setLoadError(error.message);
      else {
        setLoadError(null);
        const byType: Partial<Record<DailyContentType, DailyContentItem>> = {};
        for (const item of (data || []) as DailyContentItem[]) byType[item.content_type] = item;
        setItems(byType);
      }
      setLoading(false);
    }
    void loadItems();
    const channel = supabase.channel(`daily-carousel-${today}`).on('postgres_changes', { event: '*', schema: 'public', table: 'daily_carousel_content' }, () => void loadItems()).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, []);

  function selectSlide(index: number) {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
    setSelectedOption(null);
    setAnswerSubmitted(false);
  }
  function moveSlide(direction: -1 | 1) { selectSlide(activeIndex + direction); }
  function onTouchStart(event: React.TouchEvent<HTMLElement>) { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }
  function onTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) moveSlide(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }
  const publicAssetUrl = (path: string) => supabase.storage.from('daily-carousel-assets').getPublicUrl(path).data.publicUrl;
  const ActiveIcon = activeSlide.icon;

  return (
    <section className="daily-mission-carousel" aria-label="Daily learning carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="daily-mission-copy">
        <div className="daily-mission-topline">
          <span className="daily-mission-kicker">TODAY'S MISSION</span>
          <span className="daily-mission-target"><Target size={14}/> A little progress, every day</span>
        </div>

        <div className="daily-mission-heading">
          <p>{activeSlide.eyebrow}</p>
          <h2>{activeItem?.title || (activeSlide.type === 'topic' ? 'Build one strong concept.' : activeSlide.type === 'question' ? 'Think beyond the obvious.' : 'Test what you know.')}</h2>
          {loading ? (
            <div className="daily-mission-status"><Loader2 size={14} className="animate-spin"/> Loading today's edition…</div>
          ) : loadError ? (
            <p className="daily-mission-body">Today's learning could not be loaded. Please try again shortly.</p>
          ) : activeItem ? (
            activeSlide.type === 'mcq' ? <p className="daily-mission-body">Choose an answer. Turn the card over to see the correct option and explanation.</p> : <p className="daily-mission-body">{activeItem.body}</p>
          ) : (
            <p className="daily-mission-body">Your faculty team has not published this item yet. Explore another part of today's edition.</p>
          )}
        </div>

        {activeSlide.type === 'mcq' && activeItem && !loading && (
          <div className={`daily-flip-scene ${answerSubmitted ? 'is-flipped' : ''}`} aria-live="polite">
            <div className="daily-flip-inner">
              <div className="daily-flip-face daily-flip-front">
                <div className="daily-flip-card-top"><span className="daily-flip-label">KNOWLEDGE CHECK</span><span className="daily-flip-count">01 / 01</span></div>
                <h3 className="daily-flip-question">{activeItem.body || activeItem.title}</h3>
                <p className="daily-flip-instruction">Choose the most accurate answer</p>
                <div className="daily-flip-options">
                  {(activeItem.options || []).slice(0, 4).map((option, index) => (
                    <button key={activeItem.id + '-' + index} type="button" aria-pressed={selectedOption === index} onClick={() => setSelectedOption(index)} className={selectedOption === index ? 'selected' : ''}>
                      <span className="daily-flip-option-letter">{String.fromCharCode(65 + index)}</span><span className="daily-flip-option-text">{option}</span><span className="daily-flip-radio"/>
                    </button>
                  ))}
                </div>
                <div className="daily-flip-submit-row"><span className="daily-flip-hint">One correct answer</span><button type="button" className="daily-flip-submit" disabled={selectedOption === null || (activeItem.options || []).length < 4 || activeItem.correct_option === null} onClick={() => setAnswerSubmitted(true)}>Check answer <ArrowRight size={15}/></button></div>
                {(activeItem.options || []).length < 4 ? <p className="daily-flip-validation">This question is awaiting four complete answer options.</p> : null}
              </div>
              <div className="daily-flip-face daily-flip-back">
                <div className="daily-flip-result-heading"><span className={selectedOption === activeItem.correct_option ? 'daily-flip-result-icon correct' : 'daily-flip-result-icon incorrect'}>{selectedOption === activeItem.correct_option ? <CircleCheck size={21}/> : <CircleX size={21}/>}</span><div><span className="daily-flip-label">ANSWER REVEALED</span><h3>{selectedOption === activeItem.correct_option ? 'Well reasoned.' : 'Review the concept.'}</h3></div></div>
                <div className="daily-flip-correct-answer"><span>CORRECT OPTION</span><strong>{String.fromCharCode(65 + (activeItem.correct_option ?? 0))}. {(activeItem.options || [])[activeItem.correct_option ?? 0]}</strong></div>
                <div className="daily-flip-explanation"><span>FACULTY EXPLANATION</span><p>{activeItem.explanation || 'An explanation has not been added yet.'}</p></div>
                <div className="daily-flip-back-actions"><button type="button" onClick={() => { setAnswerSubmitted(false); setSelectedOption(null); }}><RotateCcw size={14}/> Try again</button><span>{selectedOption === activeItem.correct_option ? 'Correct response' : 'Use the explanation to revise'}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeItem?.pdf_paths?.length ? <div className="daily-mission-pdfs">{activeItem.pdf_paths.map((path, index) => <a key={path} href={publicAssetUrl(path)} target="_blank" rel="noreferrer">Open study note {index + 1} <ArrowRight size={12}/></a>)}</div> : null}

        <div className="daily-mission-controls">
          <div className="daily-mission-tabs" role="tablist" aria-label="Daily edition slides">
            {SLIDES.map((slide, index) => (
              <button key={slide.type} type="button" role="tab" aria-selected={activeIndex === index} onClick={() => selectSlide(index)} className={activeIndex === index ? 'active' : ''}><slide.icon size={13}/>{slide.label}</button>
            ))}
          </div>
          <div className="daily-mission-arrows"><button type="button" onClick={() => moveSlide(-1)} aria-label="Previous slide"><ChevronLeft size={16}/></button><button type="button" onClick={() => moveSlide(1)} aria-label="Next slide"><ChevronRight size={16}/></button></div>
        </div>

        <div className="daily-mission-footer">
          <button type="button" className="daily-mission-cta" onClick={() => router.push('/quizzes')}>Explore practice papers <ArrowRight size={17}/></button>
          <div className="daily-mission-pagination" aria-label={`Slide ${activeIndex + 1} of ${SLIDES.length}`}>{SLIDES.map((slide, index) => <button key={slide.type} type="button" aria-label={`Go to ${slide.label}`} aria-current={activeIndex === index ? 'step' : undefined} onClick={() => selectSlide(index)} className={activeIndex === index ? 'active' : ''}/>)}</div>
        </div>
      </div>

      <div className="daily-mission-art" aria-label={activeItem?.image_paths?.length ? 'Daily learning artwork' : 'Daily learning edition'}>
        {activeItem?.image_paths?.length ? (
          <div className="daily-mission-feature-image"><img src={publicAssetUrl(activeItem.image_paths[0])} alt={activeItem.title}/></div>
        ) : (
          <div className="daily-mission-books">{SLIDES.map((slide, index) => { const Icon = slide.icon; return <div className={`daily-mission-book book-${index + 1}`} key={slide.type}><Icon size={24}/><span>{slide.label.toUpperCase()}</span></div>; })}</div>
        )}
        <div className="daily-mission-orbit"><CalendarDays size={23}/></div>
        <span className="daily-mission-art-caption">READ · REFLECT · RECALL</span>
      </div>
    </section>
  );
}
