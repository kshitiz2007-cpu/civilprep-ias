'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Loader2,
  Target,
} from 'lucide-react';
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

const SLIDES: { type: DailyContentType; label: string; eyebrow: string }[] = [
  { type: 'topic', label: 'Topic', eyebrow: 'Topic of the day' },
  { type: 'question', label: 'Question', eyebrow: 'Question of the day' },
  { type: 'mcq', label: 'MCQ', eyebrow: 'MCQ of the day' },
];

const SUBJECTS = ['POLITY', 'ECONOMY', 'HISTORY'];

function localDateKey() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
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
      const { data, error } = await supabase
        .from('daily_carousel_content')
        .select('*')
        .eq('publish_date', today);

      if (!active) return;
      if (error) {
        setLoadError(error.message);
      } else {
        setLoadError(null);
        const byType: Partial<Record<DailyContentType, DailyContentItem>> = {};
        for (const item of (data || []) as DailyContentItem[]) byType[item.content_type] = item;
        setItems(byType);
      }
      setLoading(false);
    }

    void loadItems();
    const channel = supabase
      .channel(`daily-carousel-${today}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_carousel_content' }, () => void loadItems())
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  function selectSlide(index: number) {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
    setSelectedOption(null);
    setAnswerSubmitted(false);
  }

  function moveSlide(direction: -1 | 1) {
    selectSlide(activeIndex + direction);
  }

  function onTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) moveSlide(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  const publicAssetUrl = (path: string) =>
    supabase.storage.from('daily-carousel-assets').getPublicUrl(path).data.publicUrl;

  return (
    <section
      aria-label="Daily learning carousel"
      className="daily-mission-carousel mb-6"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="daily-mission-copy">
        <div className="daily-mission-topline">
          <span className="daily-mission-kicker">TODAY'S MISSION</span>
          <span className="daily-mission-target"><Target size={16} /> Target · 2 hrs</span>
        </div>

        <div className="daily-mission-heading">
          <p>{activeSlide.eyebrow}</p>
          <h2>{activeItem?.title || 'Learn something today'}</h2>
          {loading ? (
            <div className="daily-mission-status"><Loader2 size={15} className="animate-spin" /> Loading today's learning plan</div>
          ) : loadError ? (
            <p className="daily-mission-status">Today's content is temporarily unavailable.</p>
          ) : activeItem ? (
            <p className="daily-mission-body">{activeItem.body}</p>
          ) : (
            <p className="daily-mission-body">A focused topic, a thoughtful question and one MCQ — your daily step towards mastery.</p>
          )}
        </div>

        <div className="daily-mission-controls">
          <div className="daily-mission-tabs" role="tablist" aria-label="Daily content type">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.type}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                onClick={() => selectSlide(index)}
                className={activeIndex === index ? 'active' : ''}
              >
                {slide.label}
              </button>
            ))}
          </div>
          <div className="daily-mission-arrows">
            <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous daily slide"><ChevronLeft size={17} /></button>
            <button type="button" onClick={() => moveSlide(1)} aria-label="Next daily slide"><ChevronRight size={17} /></button>
          </div>
        </div>

        {activeSlide.type === 'mcq' && activeItem && (
          <div className="daily-mission-mcq">
            {activeItem.options.map((option, index) => {
              const correct = index === activeItem.correct_option;
              const selected = selectedOption === index;
              const stateClass = answerSubmitted
                ? correct ? 'correct' : selected ? 'incorrect' : ''
                : selected ? 'selected' : '';
              return (
                <button
                  key={`${activeItem.id}-${index}`}
                  type="button"
                  disabled={answerSubmitted}
                  onClick={() => setSelectedOption(index)}
                  className={stateClass}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  {answerSubmitted && correct && <CircleCheck size={16} />}
                  {answerSubmitted && selected && !correct && <CircleX size={16} />}
                </button>
              );
            })}
            {!answerSubmitted ? (
              <button type="button" className="daily-mission-check" disabled={selectedOption === null} onClick={() => setAnswerSubmitted(true)}>Check answer</button>
            ) : (
              <p className="daily-mission-explanation">
                {selectedOption === activeItem.correct_option ? 'Correct answer.' : 'Review the correct answer.'}
                {activeItem.explanation ? ` ${activeItem.explanation}` : ''}
              </p>
            )}
          </div>
        )}

        {activeItem?.pdf_paths?.length ? (
          <div className="daily-mission-pdfs">
            {activeItem.pdf_paths.map((path, index) => (
              <a key={path} href={publicAssetUrl(path)} target="_blank" rel="noreferrer">Open PDF note {index + 1}</a>
            ))}
          </div>
        ) : null}

        <div className="daily-mission-footer">
          <button type="button" className="daily-mission-cta" onClick={() => router.push('/quizzes')}>
            Start Daily Practice <ArrowRight size={20} />
          </button>
          <div className="daily-mission-pagination" aria-label={`Slide ${activeIndex + 1} of ${SLIDES.length}`}>
            {SLIDES.map((slide, index) => (
              <button key={slide.type} type="button" aria-label={`Go to ${slide.label}`} aria-current={activeIndex === index ? 'step' : undefined} onClick={() => selectSlide(index)} className={activeIndex === index ? 'active' : ''} />
            ))}
          </div>
        </div>
      </div>

      <div className="daily-mission-art" aria-label="Featured subjects">
        <div className="daily-mission-orbit" aria-hidden="true">◎</div>
        {activeItem?.image_paths?.length ? (
          <div className="daily-mission-feature-image">
            <img src={publicAssetUrl(activeItem.image_paths[0])} alt={activeItem.title} />
          </div>
        ) : (
          <div className="daily-mission-books">
            {SUBJECTS.map((subject, index) => <span key={subject} className={`daily-mission-book book-${index + 1}`}>{subject}</span>)}
          </div>
        )}
        <span className="daily-mission-art-caption">A LITTLE PROGRESS, EVERY DAY</span>
      </div>
    </section>
  );
}
