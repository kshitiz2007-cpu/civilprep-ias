'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Loader2,
  Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { DailyContentItem, DailyContentType } from '@/components/DailyContentCarousel';

type DailyContentForm = {
  title: string;
  body: string;
  options: string[];
  correctOption: string;
  explanation: string;
  imagePaths: string[];
  pdfPaths: string[];
  imageFiles: File[];
  pdfFiles: File[];
};

const CONTENT_TYPES: {
  type: DailyContentType;
  label: string;
  icon: typeof BookOpen;
}[] = [
  { type: 'topic', label: 'Topic of the day', icon: BookOpen },
  { type: 'question', label: 'Question of the day', icon: Lightbulb },
  { type: 'mcq', label: 'MCQ of the day', icon: FileQuestion },
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

function createEmptyForms(): Record<DailyContentType, DailyContentForm> {
  return {
    topic: { title: '', body: '', options: ['', '', '', ''], correctOption: '', explanation: '', imagePaths: [], pdfPaths: [], imageFiles: [], pdfFiles: [] },
    question: { title: '', body: '', options: ['', '', '', ''], correctOption: '', explanation: '', imagePaths: [], pdfPaths: [], imageFiles: [], pdfFiles: [] },
    mcq: { title: '', body: '', options: ['', '', '', ''], correctOption: '', explanation: '', imagePaths: [], pdfPaths: [], imageFiles: [], pdfFiles: [] },
  };
}

export default function DailyCarouselManager() {
  const [publishDate, setPublishDate] = useState(localDateKey);
  const [forms, setForms] = useState(createEmptyForms);
  const [savedAssets, setSavedAssets] = useState<Record<DailyContentType, { imagePaths: string[]; pdfPaths: string[] }>>({
    topic: { imagePaths: [], pdfPaths: [] },
    question: { imagePaths: [], pdfPaths: [] },
    mcq: { imagePaths: [], pdfPaths: [] },
  });
  const [savedTypes, setSavedTypes] = useState<Set<DailyContentType>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<DailyContentType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDay() {
      setLoading(true);
      setErrorMessage(null);
      const { data, error } = await supabase
        .from('daily_carousel_content')
        .select('*')
        .eq('publish_date', publishDate);

      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const nextForms = createEmptyForms();
      const nextSavedTypes = new Set<DailyContentType>();
      for (const item of (data || []) as DailyContentItem[]) {
        nextSavedTypes.add(item.content_type);
        nextForms[item.content_type] = {
          title: item.title || '',
          body: item.body || '',
          options: item.content_type === 'mcq'
            ? [...(item.options || []), '', '', '', ''].slice(0, 4)
            : ['', '', '', ''],
          correctOption: item.correct_option === null ? '' : String(item.correct_option),
          explanation: item.explanation || '',
          imagePaths: item.image_paths || [],
          pdfPaths: item.pdf_paths || [],
          imageFiles: [],
          pdfFiles: [],
        };
      }
      setSavedAssets({
        topic: { imagePaths: nextForms.topic.imagePaths, pdfPaths: nextForms.topic.pdfPaths },
        question: { imagePaths: nextForms.question.imagePaths, pdfPaths: nextForms.question.pdfPaths },
        mcq: { imagePaths: nextForms.mcq.imagePaths, pdfPaths: nextForms.mcq.pdfPaths },
      });
      setForms(nextForms);
      setSavedTypes(nextSavedTypes);
      setLoading(false);
    }

    void loadDay();
    return () => {
      active = false;
    };
  }, [publishDate]);

  function updateForm(
    type: DailyContentType,
    key: keyof DailyContentForm,
    value: string | string[] | File[]
  ) {
    setForms((previous) => ({
      ...previous,
      [type]: { ...previous[type], [key]: value },
    }));
    setSuccessMessage(null);
  }

  async function publish(type: DailyContentType, event: React.FormEvent) {
    event.preventDefault();
    const form = forms[type];
    const hasAttachments = Boolean(
      form.imagePaths.length ||
      form.pdfPaths.length ||
      form.imageFiles.length ||
      form.pdfFiles.length
    );
    if (!form.title.trim()) {
      setErrorMessage('Add a title before publishing.');
      return;
    }
    if (type === 'mcq' && !form.body.trim()) {
      setErrorMessage('Add the MCQ question text.');
      return;
    }
    if (type !== 'mcq' && !form.body.trim() && !hasAttachments) {
      setErrorMessage('Add text notes or attach an image or PDF note.');
      return;
    }

    const options = form.options.map((option) => option.trim());
    if (type === 'mcq' && options.some((option) => !option)) {
      setErrorMessage('Fill in all four MCQ options.');
      return;
    }
    if (type === 'mcq' && form.correctOption === '') {
      setErrorMessage('Select the correct answer for the MCQ.');
      return;
    }
    if (form.imageFiles.some((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
      setErrorMessage('Images must be valid image files smaller than 10 MB each.');
      return;
    }
    if (form.pdfFiles.some((file) => file.type !== 'application/pdf' || file.size > 25 * 1024 * 1024)) {
      setErrorMessage('PDF notes must be valid PDF files smaller than 25 MB each.');
      return;
    }

    setSavingType(type);
    setErrorMessage(null);
    setSuccessMessage(null);
    const uploadedPaths: string[] = [];
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user.id) throw new Error('Sign in again to publish daily content.');

      const uploadFiles = async (files: File[], kind: 'images' | 'pdfs') => {
        const paths: string[] = [];
        for (const file of files) {
          const extension = file.name.split('.').pop()?.toLowerCase() || (kind === 'pdfs' ? 'pdf' : 'img');
          const path = `${publishDate}/${type}/${kind}/${crypto.randomUUID()}.${extension}`;
          const { error } = await supabase.storage
            .from('daily-carousel-assets')
            .upload(path, file, { contentType: file.type, upsert: false });
          if (error) throw error;
          paths.push(path);
          uploadedPaths.push(path);
        }
        return paths;
      };

      const newImagePaths = await uploadFiles(form.imageFiles, 'images');
      const newPdfPaths = await uploadFiles(form.pdfFiles, 'pdfs');
      const imagePaths = [...form.imagePaths, ...newImagePaths];
      const pdfPaths = [...form.pdfPaths, ...newPdfPaths];

      const { error } = await supabase.from('daily_carousel_content').upsert(
        {
          content_type: type,
          publish_date: publishDate,
          title: form.title.trim(),
          body: form.body.trim(),
          options: type === 'mcq' ? options : [],
          correct_option: type === 'mcq' ? Number(form.correctOption) : null,
          explanation: type === 'mcq' ? form.explanation.trim() || null : null,
          image_paths: imagePaths,
          pdf_paths: pdfPaths,
          created_by: session.user.id,
        },
        { onConflict: 'content_type,publish_date' }
      );
      if (error) throw error;
      uploadedPaths.length = 0;

      const removedPaths = [
        ...savedAssets[type].imagePaths.filter((path) => !imagePaths.includes(path)),
        ...savedAssets[type].pdfPaths.filter((path) => !pdfPaths.includes(path)),
      ];
      if (removedPaths.length) {
        const { error: removeError } = await supabase.storage
          .from('daily-carousel-assets')
          .remove(removedPaths);
        if (removeError) console.error('Could not remove old carousel files:', removeError);
      }

      setSavedTypes((previous) => new Set(previous).add(type));
      setSavedAssets((previous) => ({
        ...previous,
        [type]: { imagePaths, pdfPaths },
      }));
      setForms((previous) => ({
        ...previous,
        [type]: { ...previous[type], imagePaths, pdfPaths, imageFiles: [], pdfFiles: [] },
      }));
      setSuccessMessage(`${CONTENT_TYPES.find((item) => item.type === type)?.label} published for ${publishDate}.`);
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from('daily-carousel-assets').remove(uploadedPaths);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Could not publish daily content.');
    } finally {
      setSavingType(null);
    }
  }

  return (
    <div className="space-y-6 text-[var(--app-text)]">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--app-border)] pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--app-accent)]">
            Student dashboard publishing
          </p>
          <h2 className="mt-1 text-2xl font-bold">Daily Carousel</h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Add text notes or media separately for each carousel section.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--app-muted)]">
          <CalendarDays className="h-4 w-4 text-[var(--app-accent)]" />
          Publish date
          <input
            type="date"
            value={publishDate}
            onChange={(event) => setPublishDate(event.target.value)}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-strong)] px-3 py-2 text-sm text-[var(--app-text)]"
          />
        </label>
      </header>

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMessage}
        </p>
      )}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--app-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading saved content
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {CONTENT_TYPES.map(({ type, label, icon: Icon }) => {
            const form = forms[type];
            const hasFormAttachments = Boolean(
              form.imagePaths.length ||
              form.pdfPaths.length ||
              form.imageFiles.length ||
              form.pdfFiles.length
            );
            return (
              <form
                key={type}
                onSubmit={(event) => void publish(type, event)}
                className="space-y-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold">{label}</h3>
                      <p className="text-xs text-[var(--app-muted)]">{savedTypes.has(type) ? 'Published for this date' : 'Not published yet'}</p>
                    </div>
                  </div>
                  {savedTypes.has(type) && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </div>

                <label className="block space-y-1.5 text-xs font-semibold text-[var(--app-muted)]">
                  Title
                  <input
                    required
                    maxLength={180}
                    value={form.title}
                    onChange={(event) => updateForm(type, 'title', event.target.value)}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-accent)]"
                  />
                </label>

                <label className="block space-y-1.5 text-xs font-semibold text-[var(--app-muted)]">
                  {type === 'topic' ? 'Topic notes' : type === 'mcq' ? 'Question' : 'Prompt'}
                  <textarea
                    required={type === 'mcq' || !hasFormAttachments}
                    rows={type === 'mcq' ? 3 : 5}
                    value={form.body}
                    onChange={(event) => updateForm(type, 'body', event.target.value)}
                    className="w-full resize-y rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text)] outline-none focus:border-[var(--app-accent)]"
                  />
                </label>

                {type === 'mcq' && (
                  <>
                    <fieldset className="space-y-2">
                      <legend className="mb-2 text-xs font-semibold text-[var(--app-muted)]">Answer options</legend>
                      {form.options.map((option, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <span className="w-5 shrink-0 text-xs font-bold text-[var(--app-muted)]">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            required
                            value={option}
                            onChange={(event) => {
                              const nextOptions = [...form.options];
                              nextOptions[index] = event.target.value;
                              updateForm(type, 'options', nextOptions);
                            }}
                            className="min-w-0 flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-3 py-2 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-accent)]"
                          />
                        </label>
                      ))}
                    </fieldset>
                    <label className="block space-y-1.5 text-xs font-semibold text-[var(--app-muted)]">
                      Correct option
                      <select
                        required
                        value={form.correctOption}
                        onChange={(event) => updateForm(type, 'correctOption', event.target.value)}
                        className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-3 py-2.5 text-sm text-[var(--app-text)]"
                      >
                        <option value="">Select answer</option>
                        {form.options.map((_, index) => (
                          <option key={index} value={index}>{String.fromCharCode(65 + index)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-1.5 text-xs font-semibold text-[var(--app-muted)]">
                      Explanation (optional)
                      <textarea
                        rows={3}
                        value={form.explanation}
                        onChange={(event) => updateForm(type, 'explanation', event.target.value)}
                        className="w-full resize-y rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-elevated)] px-3 py-2.5 text-sm leading-relaxed text-[var(--app-text)] outline-none focus:border-[var(--app-accent)]"
                      />
                    </label>
                  </>
                )}

                <div className="space-y-4 border-t border-[var(--app-border)] pt-4">
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-[var(--app-muted)]">Image notes / slideshow</legend>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => updateForm(type, 'imageFiles', Array.from(event.target.files || []))}
                      className="block w-full text-xs text-[var(--app-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--app-accent-soft)] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[var(--app-accent)]"
                    />
                    <p className="text-[11px] text-[var(--app-muted)]">Optional. Upload one or more images, up to 10 MB each, for the slideshow.</p>
                    <div className="space-y-1.5">
                      {form.imagePaths.map((path) => (
                        <div key={path} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--app-surface-muted)] px-2.5 py-2 text-xs">
                          <span className="min-w-0 truncate">{path.split('/').pop()}</span>
                          <button
                            type="button"
                            aria-label="Remove saved image"
                            onClick={() => updateForm(type, 'imagePaths', form.imagePaths.filter((item) => item !== path))}
                            className="shrink-0 font-bold text-rose-300 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {form.imageFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--app-accent-soft)] px-2.5 py-2 text-xs">
                          <span className="min-w-0 truncate">{file.name}</span>
                          <button
                            type="button"
                            aria-label="Remove selected image"
                            onClick={() => updateForm(type, 'imageFiles', form.imageFiles.filter((_, fileIndex) => fileIndex !== index))}
                            className="shrink-0 font-bold text-rose-300 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-[var(--app-muted)]">PDF notes</legend>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      multiple
                      onChange={(event) => updateForm(type, 'pdfFiles', Array.from(event.target.files || []))}
                      className="block w-full text-xs text-[var(--app-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--app-accent-soft)] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[var(--app-accent)]"
                    />
                    <p className="text-[11px] text-[var(--app-muted)]">PDF files up to 25 MB each.</p>
                    <div className="space-y-1.5">
                      {form.pdfPaths.map((path) => (
                        <div key={path} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--app-surface-muted)] px-2.5 py-2 text-xs">
                          <span className="min-w-0 truncate">{path.split('/').pop()}</span>
                          <button
                            type="button"
                            aria-label="Remove saved PDF"
                            onClick={() => updateForm(type, 'pdfPaths', form.pdfPaths.filter((item) => item !== path))}
                            className="shrink-0 font-bold text-rose-300 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {form.pdfFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--app-accent-soft)] px-2.5 py-2 text-xs">
                          <span className="min-w-0 truncate">{file.name}</span>
                          <button
                            type="button"
                            aria-label="Remove selected PDF"
                            onClick={() => updateForm(type, 'pdfFiles', form.pdfFiles.filter((_, fileIndex) => fileIndex !== index))}
                            className="shrink-0 font-bold text-rose-300 hover:text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <button
                  type="submit"
                  disabled={savingType !== null}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--app-accent)] px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {savingType === type ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savedTypes.has(type) ? 'Update content' : 'Publish content'}
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
