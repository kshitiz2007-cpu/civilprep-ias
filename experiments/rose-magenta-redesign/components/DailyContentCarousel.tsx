'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Loader2 } from 'lucide-react';
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
  const [items, setItems] = useState<Partial<Record<DailyContentType, DailyContentItem>>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const activeSlide = SLIDES[activeIndex];
  const activeItem = items[activeSlide.type];

  useEffect(() => {
    const imageCount = activeItem?.image_paths?.length || 0;
    if (imageCount < 2) return;
    const timer = window.setInterval(() => {
      setImageIndex((index) => (index + 1) % imageCount);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeItem?.id, activeItem?.image_paths?.length]);

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
        for (const item of (data || []) as DailyContentItem[]) {
          byType[item.content_type] = item;
        }
        setItems(byType);
      }
      setLoading(false);
    }

    void loadItems();
    const channel = supabase
      .channel(`daily-carousel-${today}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_carousel_content' },
        () => void loadItems()
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  function moveSlide(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + SLIDES.length) % SLIDES.length);
    setImageIndex(0);
    setSelectedOption(null);
    setAnswerSubmitted(false);
  }

  function selectSlide(index: number) {
    setActiveIndex(index);
    setImageIndex(0);
    setSelectedOption(null);
    setAnswerSubmitted(false);
  }

  return (
    <section
      aria-label="Daily learning carousel"
      className="mb-7 overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-panel-strong)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--app-border)] px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--app-accent)]">
            Daily practice
          </p>
          <h2 className="mt-1 text-lg font-bold text-[var(--app-text)]">Learn something today</h2>
        </div>
        <div className="flex items-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.type}
              type="button"
              onClick={() => selectSlide(index)}
              aria-current={activeIndex === index ? 'step' : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeIndex === index
                  ? 'bg-[var(--app-accent)] text-slate-950'
                  : 'bg-[var(--app-surface-muted)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              {slide.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => moveSlide(-1)}
            aria-label="Previous daily item"
            className="ml-1 rounded-full border border-[var(--app-border)] p-2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => moveSlide(1)}
            aria-label="Next daily item"
            className="rounded-full border border-[var(--app-border)] p-2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-64 gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] md:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-secondary)]">
            {activeSlide.eyebrow}
          </p>
          {loading ? (
            <div className="mt-8 flex items-center gap-2 text-sm text-[var(--app-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading today’s content
            </div>
          ) : loadError ? (
            <p role="status" className="mt-4 text-sm text-[var(--app-muted)]">
              Daily content is temporarily unavailable.
            </p>
          ) : !activeItem ? (
            <p className="mt-4 text-sm text-[var(--app-muted)]">
              This daily item has not been published yet.
            </p>
          ) : (
            <>
              <h3 className="mt-2 text-xl font-bold leading-snug text-[var(--app-text)] sm:text-2xl">
                {activeItem.title}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-muted)]">
                {activeItem.body}
              </p>

              {activeSlide.type === 'mcq' && (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {activeItem.options.map((option, index) => {
                    const isCorrect = index === activeItem.correct_option;
                    const isSelected = selectedOption === index;
                    const resultStyle = answerSubmitted
                      ? isCorrect
                        ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                        : isSelected
                          ? 'border-rose-400/60 bg-rose-500/10 text-rose-200'
                          : 'border-[var(--app-border)] text-[var(--app-muted)]'
                      : isSelected
                        ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-text)]'
                        : 'border-[var(--app-border)] text-[var(--app-text)] hover:border-[var(--app-accent)]';
                    return (
                      <button
                        key={`${activeItem.id}-${index}`}
                        type="button"
                        disabled={answerSubmitted}
                        onClick={() => setSelectedOption(index)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${resultStyle}`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                        {answerSubmitted && isCorrect && <CircleCheck className="ml-auto h-4 w-4 shrink-0" />}
                        {answerSubmitted && isSelected && !isCorrect && <CircleX className="ml-auto h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                  {!answerSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={() => setAnswerSubmitted(true)}
                      className="w-fit rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Check answer
                    </button>
                  ) : (
                    <p role="status" className="text-sm font-semibold text-[var(--app-text)]">
                      {selectedOption === activeItem.correct_option ? 'Correct answer.' : 'Review the correct answer.'}
                      {activeItem.explanation && (
                        <span className="mt-1 block font-normal text-[var(--app-muted)]">{activeItem.explanation}</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="space-y-3">
          {activeItem?.image_paths?.length ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-elevated)]">
              <img
                src={supabase.storage.from('daily-carousel-assets').getPublicUrl(activeItem.image_paths[imageIndex]).data.publicUrl}
                alt={`${activeItem.title} image ${imageIndex + 1}`}
                className="h-full w-full object-cover"
              />
              {activeItem.image_paths.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((index) => (index - 1 + activeItem.image_paths.length) % activeItem.image_paths.length)}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((index) => (index + 1) % activeItem.image_paths.length)}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/75 p-2 text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] text-white">
                    {imageIndex + 1} / {activeItem.image_paths.length}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="grid aspect-[16/10] place-items-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] text-xs text-[var(--app-muted)]">
              No image notes uploaded
            </div>
          )}

          {activeItem?.pdf_paths?.length ? (
            <div className="flex flex-wrap gap-2">
              {activeItem.pdf_paths.map((path, index) => (
                <a
                  key={path}
                  href={supabase.storage.from('daily-carousel-assets').getPublicUrl(path).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:border-[var(--app-accent)]"
                >
                  Open PDF note {index + 1}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--app-muted)]">No PDF notes uploaded</p>
          )}

          <div className="flex items-center justify-center gap-1.5">
            {SLIDES.map((slide, index) => (
              <span
                key={slide.type}
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-8 bg-[var(--app-accent)]' : 'w-3 bg-[var(--app-border-strong)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
