'use client';

import { useEffect, useState } from 'react';
import { Check, Palette, Sun, Type } from 'lucide-react';

const THEMES = [
  {
    id: 'rose',
    label: 'Rose Atelier',
    subtitle: 'Blush, rose and champagne gold',
    swatch: 'from-rose-200 via-pink-400 to-amber-300',
  },
  {
    id: 'champagne',
    label: 'Champagne Glow',
    subtitle: 'Warm ivory with soft gold accents',
    swatch: 'from-amber-100 via-yellow-200 to-rose-300',
  },
  {
    id: 'magenta',
    label: 'Magenta Bloom',
    subtitle: 'A richer rose-magenta accent',
    swatch: 'from-pink-300 via-fuchsia-500 to-rose-500',
  },
];

export default function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('rose');
  const [fontScale, setFontScale] = useState<'compact' | 'normal' | 'large'>('normal');

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem('gyankunj-theme');
      const savedScale = window.localStorage.getItem('gyankunj-font-scale') as 'compact' | 'normal' | 'large' | null;
      const validTheme = THEMES.some((item) => item.id === savedTheme) ? savedTheme : 'rose';
      setTheme(validTheme);
      document.documentElement.dataset.theme = validTheme;
      if (savedScale) {
        setFontScale(savedScale);
        document.documentElement.dataset.fontScale = savedScale;
      }
    } catch {
      document.documentElement.dataset.theme = 'rose';
    }
  }, []);

  const applyTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem('gyankunj-theme', nextTheme);
    } catch {
      // Ignore storage errors in restricted environments
    }
  };

  const applyScale = (nextScale: 'compact' | 'normal' | 'large') => {
    setFontScale(nextScale);
    document.documentElement.dataset.fontScale = nextScale;
    try {
      window.localStorage.setItem('gyankunj-font-scale', nextScale);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="theme-control"
        aria-expanded={open}
        title="Reading ambience & comfort"
      >
        {theme === 'champagne' ? <Sun className="h-4 w-4 text-amber-600" /> : <Palette className="h-4 w-4 text-[var(--app-accent)]" />}
        {!compact && <span>Ambience</span>}
      </button>

      {open && (
        <div className="theme-menu">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Visual ambience
            </p>
            <Sun className="h-3.5 w-3.5 text-[var(--app-muted)]" />
          </div>

          <div className="space-y-1">
            {THEMES.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  applyTheme(item.id);
                  setOpen(false);
                }}
                className="theme-choice"
              >
                <span className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br ${item.swatch} border border-white/20`} />
                <span className="flex-1 text-left">
                  <span className="block text-xs font-semibold leading-tight">{item.label}</span>
                  <span className="block text-[10px] text-[var(--app-muted)]">{item.subtitle}</span>
                </span>
                {theme === item.id && <Check className="h-4 w-4 text-[var(--app-accent)]" />}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-[var(--app-border)] pt-2.5 px-1">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
              <Type className="h-3 w-3" /> Reading Text Scale
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['compact', 'normal', 'large'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => applyScale(scale)}
                  className={`rounded-lg py-1 text-xs font-semibold capitalize transition ${
                    fontScale === scale
                      ? 'bg-[var(--app-accent)] text-white'
                      : 'bg-[var(--app-surface-muted)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {scale === 'compact' ? 'A-' : scale === 'normal' ? 'Default' : 'A+'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}