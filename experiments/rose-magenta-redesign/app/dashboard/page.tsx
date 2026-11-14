'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FALLBACK_ATTEMPTS, FALLBACK_QUIZZES } from '@/lib/mockData';
import { openWatermarkStudio } from '@/lib/pdfExporter';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  History,
  Landmark,
  Layers,
  Loader2,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import StudentChatWidget from '@/components/StudentChatWidget';
import StudentStudyHome from '@/components/student/StudentStudyHome';

type Attempt = {
  id: string;
  quiz_id: string;
  quiz_title?: string;
  category?: string;
  score: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  total?: number;
  completed_at?: string;
};

type Quiz = {
  id: string;
  title: string;
  category?: string;
  section?: string;
  description?: string;
  duration?: number;
  time_limit?: number;
  questions?: any[];
};

const GS_PILLARS = [
  'Polity',
  'History',
  'Economy',
  'Geography',
  'Environment',
  'Science & Tech',
  'Current Affairs',
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [resourceCount, setResourceCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [broadcastNotice, setBroadcastNotice] = useState<string>('');

  // Custom Smart Drill Builder Modal
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillSubject, setDrillSubject] = useState('All Subjects');
  const [drillCount, setDrillCount] = useState(5);

  // Calm Pomodoro / Deep Study Timer (25 min default)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        let profile: any = null;
        let quizData: any[] | null = null;
        let attemptData: any[] | null = null;
        let count: number | null = null;

        if (session?.user?.id) {
          const [profRes, qRes, aRes, rRes] = await Promise.all([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle(),
            supabase
              .from('quizzes')
              .select('*')
              .eq('active', true)
              .order('created_at', { ascending: false })
              .limit(8),
            supabase
              .from('attempts')
              .select(
                'id,quiz_id,quiz_title,category,score,correct,wrong,skipped,total,completed_at'
              )
              .eq('user_id', session.user.id)
              .order('completed_at', { ascending: false }),
            supabase
              .from('resources')
              .select('*', { count: 'exact', head: true }),
          ]);
          profile = profRes.data;
          quizData = qRes.data;
          attemptData = aRes.data;
          count = rRes.count;

          if (
            profile?.role === 'admin' ||
            session.user.email === 'kshitiz2007@gmail.com' ||
            session.user.email === 'admin@civilprep.in'
          ) {
            window.location.href = '/admin';
            return;
          }
        }

        if (!active) return;

        setUser(
          profile || {
            id: session?.user?.id || 'demo_user',
            name:
              session?.user?.user_metadata?.full_name || 'Aarav Sharma (CSE Cohort)',
            email: session?.user?.email || 'aspirant@gyankunj.in',
          }
        );

        const mergedQuizzes =
          quizData && quizData.length > 0
            ? (quizData as Quiz[])
            : (FALLBACK_QUIZZES as unknown as Quiz[]);
        setQuizzes(mergedQuizzes);

        let localAttempts: Attempt[] = [];
        try {
          localAttempts = JSON.parse(
            window.localStorage.getItem('gyankunj-local-attempts') || '[]'
          );
        } catch {
          // ignore
        }

        const mergedAttempts =
          attemptData && attemptData.length > 0
            ? [...localAttempts, ...(attemptData as Attempt[])]
            : localAttempts.length > 0
            ? localAttempts
            : (FALLBACK_ATTEMPTS as unknown as Attempt[]);

        setAttempts(mergedAttempts);
        setResourceCount(count || 4);

        try {
          const savedNotice = window.localStorage.getItem(
            'gyankunj-admin-broadcast'
          );
          if (savedNotice) setBroadcastNotice(savedNotice);
        } catch {
          // ignore
        }
      } catch {
        if (active) {
          setUser({
            id: 'demo_user',
            name: 'Aarav Sharma',
            email: 'aspirant@gyankunj.in',
          });
          setQuizzes(FALLBACK_QUIZZES as unknown as Quiz[]);
          setAttempts(FALLBACK_ATTEMPTS as unknown as Attempt[]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focusRunning) return;
    const id = window.setInterval(() => {
      setFocusSeconds((prev) => {
        if (prev <= 1) {
          setFocusRunning(false);
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [focusRunning]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const launchCustomDrill = () => {
    const pool: any[] = [];
    const sourceList =
      quizzes.length > 0 ? quizzes : (FALLBACK_QUIZZES as unknown as Quiz[]);

    sourceList.forEach((q) => {
      if (
        drillSubject === 'All Subjects' ||
        (q.category || '').toLowerCase() === drillSubject.toLowerCase()
      ) {
        (q.questions || []).forEach((item: any) => {
          pool.push({ ...item, subject: q.category || 'General Studies' });
        });
      }
    });

    const selectedQuestions = (
      pool.length > 0 ? pool : FALLBACK_QUIZZES.flatMap((q) => q.questions)
    ).slice(0, drillCount);

    const drillId = `custom-drill-${Date.now()}`;
    const customQuiz = {
      id: drillId,
      title: `Custom Smart Drill — ${drillSubject} (${selectedQuestions.length} Qs)`,
      category: drillSubject === 'All Subjects' ? 'GS Mixed' : drillSubject,
      time_limit: Math.max(5, selectedQuestions.length * 2),
      positive_marks: 2.0,
      negative_marking: 0.66,
      questions: selectedQuestions,
    };

    try {
      window.localStorage.setItem(
        `gyankunj-custom-quiz-${drillId}`,
        JSON.stringify(customQuiz)
      );
    } catch {
      // ignore
    }
    setShowDrillModal(false);
    router.push(`/quiz/${drillId}`);
  };

  const average = attempts.length
    ? Math.round(
        attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) /
          attempts.length
      )
    : 0;

  const accuracyStats = useMemo(() => {
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalQuestions = 0;
    attempts.forEach((a) => {
      totalCorrect += Number(a.correct || 0);
      totalWrong += Number(a.wrong || 0);
      totalQuestions += Number(a.total || 0);
    });
    const totalAttempted = totalCorrect + totalWrong;
    const accuracy = totalAttempted
      ? Math.round((totalCorrect / totalAttempted) * 100)
      : average;
    const netMarksLost = +(totalWrong * 0.66).toFixed(1);
    return {
      accuracy,
      netMarksLost,
      totalCorrect,
      totalWrong,
      totalAttempted,
      totalQuestions,
    };
  }, [attempts, average]);

  const subjectMastery = useMemo(() => {
    return GS_PILLARS.map((subject) => {
      const subAttempts = attempts.filter(
        (a) =>
          (a.category || '').toLowerCase() === subject.toLowerCase() ||
          (a.quiz_title || '').toLowerCase().includes(subject.toLowerCase())
      );
      const avg = subAttempts.length
        ? Math.round(
            subAttempts.reduce((s, a) => s + Number(a.score || 0), 0) /
              subAttempts.length
          )
        : null;
      return { subject, count: subAttempts.length, avg };
    });
  }, [attempts]);


  const revisionRadar = useMemo(() => {
    const attempted = subjectMastery.filter((item) => item.count > 0);
    const untested = subjectMastery.filter((item) => item.count === 0);
    const needsRevision = [...attempted]
      .sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))
      .slice(0, 3);
    return { attempted, untested, needsRevision };
  }, [subjectMastery]);

  const nextBestAction = useMemo(() => {
    const weakest = revisionRadar.needsRevision[0];
    if (weakest) return {
      title: `Rebuild ${weakest.subject} accuracy`,
      detail: `Your current average is ${weakest.avg ?? 0}% across ${weakest.count} evaluated test(s). Revise errors, then take a focused drill.`,
      subject: weakest.subject,
      action: 'Start focused drill',
    };
    const next = revisionRadar.untested[0];
    if (next) return {
      title: `Establish a ${next.subject} baseline`,
      detail: 'There is no evaluated attempt for this pillar yet. A short diagnostic will establish your starting point.',
      subject: next.subject,
      action: 'Take diagnostic drill',
    };
    return {
      title: 'Keep your revision cycle consistent',
      detail: 'Your tracked GS pillars have evaluation data. Review recent mistakes and retest the lowest-scoring topic.',
      subject: 'All Subjects',
      action: 'Build mixed drill',
    };
  }, [revisionRadar]);

  const recentScores = useMemo(() => attempts.slice(0, 7).reverse(), [attempts]);
  const completedIds = new Set(attempts.map((item) => item.quiz_id));
  const firstName =
    user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Aspirant';
  const focusFormatted = `${String(Math.floor(focusSeconds / 60)).padStart(
    2,
    '0'
  )}:${String(focusSeconds % 60).padStart(2, '0')}`;

  if (loading)
    return (
      <div className="app-theme grid min-h-screen place-items-center">
        <Loader2 className="h-9 w-9 animate-spin text-[var(--app-accent)]" />
      </div>
    );

  return (
    <div className="app-theme student-page text-[var(--app-text)]">
      {/* Desktop Sidebar */}
      <aside className="theme-surface-solid fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[var(--app-border)] px-5 py-6 md:flex">
        <div className="flex items-center gap-3 px-2">
          <BrandMark size={20} />
          <div>
            <p className="font-bold tracking-tight leading-none">Gyankunj IAS</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--app-muted)]">
              Aspirant Sanctuary
            </p>
          </div>
        </div>

        <nav className="mt-8 space-y-1.5">
          <NavItem
            icon={Activity}
            label="Study Sanctuary"
            active
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <NavItem
            icon={Layers}
            label="Prelims Test Series"
            onClick={() => router.push('/quizzes')}
          />
          <NavItem
            icon={Zap}
            label="Custom Smart Drill"
            onClick={() => setShowDrillModal(true)}
          />
          <NavItem
            icon={FileText}
            label="Study Compendiums"
            onClick={() => router.push('/resources')}
          />
          <NavItem
            icon={History}
            label="Evaluation Archive"
            onClick={() => router.push('/history')}
          />
          <NavItem
            icon={Trophy}
            label="All-India Merit List"
            onClick={() => router.push('/leaderboard')}
          />
        </nav>

        {/* Calm Deep Focus Widget inside Sidebar */}
        <div className="mt-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-accent)]">
              Calm Study Timer
            </span>
            <Clock3 className="h-3.5 w-3.5 text-[var(--app-muted)]" />
          </div>
          <p className="mt-2 font-mono-tabular text-2xl font-bold tracking-tight">
            {focusFormatted}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--app-muted)]">
            25-min distraction-free GS revision block
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setFocusRunning((r) => !r)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3 py-2 text-xs font-bold text-slate-950 transition hover:opacity-90"
            >
              {focusRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Start Focus
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFocusRunning(false);
                setFocusSeconds(25 * 60);
              }}
              className="rounded-xl border border-[var(--app-border)] p-2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
              title="Reset timer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-[var(--app-border)] pt-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-accent-soft)] text-sm font-bold text-[var(--app-accent)]">
            {firstName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user?.name || firstName}
            </p>
            <p className="truncate text-[11px] text-[var(--app-muted)]">
              CSE Target Cohort
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main relative z-10 mx-auto max-w-7xl px-5 pb-28 pt-6 md:ml-64 md:px-10 md:py-9">
        <StudentStudyHome
          firstName={firstName}
          quizzes={quizzes}
          attempts={attempts}
          resourceCount={resourceCount}
          meanScore={average}
          subjects={subjectMastery}
          recommendation={nextBestAction}
          focusSeconds={focusSeconds}
          focusRunning={focusRunning}
          broadcastNotice={broadcastNotice}
          onOpenQuiz={(id) => router.push(`/quiz/${id}`)}
          onOpenQuizzes={() => router.push('/quizzes')}
          onOpenLibrary={() => router.push('/resources')}
          onOpenResults={() => router.push('/history')}
          onOpenMerit={() => router.push('/leaderboard')}
          onOpenDrill={(subject) => { setDrillSubject(subject || 'All Subjects'); setShowDrillModal(true); }}
          onToggleFocus={() => setFocusRunning((running) => !running)}
          onResetFocus={() => { setFocusRunning(false); setFocusSeconds(25 * 60); }}
          onLogout={logout}
        />
      </main>

      {/* Custom Smart Drill Builder Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="theme-surface-solid w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <div className="flex items-center gap-2 text-[var(--app-accent)]">
                <Zap className="h-5 w-5" />
                <h3 className="text-lg font-bold text-[var(--app-text)]">
                  Custom Smart Drill Builder
                </h3>
              </div>
              <button
                onClick={() => setShowDrillModal(false)}
                className="rounded-lg p-1 text-[var(--app-muted)] hover:text-[var(--app-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
                  Select UPSC GS Pillar
                </label>
                <select
                  value={drillSubject}
                  onChange={(e) => setDrillSubject(e.target.value)}
                  className="glass-input w-full font-semibold"
                >
                  <option value="All Subjects">
                    All GS Pillars (Mixed Full Syllabus)
                  </option>
                  {GS_PILLARS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDrillCount(n)}
                      className={`rounded-xl border py-2.5 font-bold transition ${
                        drillCount === n
                          ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-slate-950'
                          : 'border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-muted)]'
                      }`}
                    >
                      {n} Questions
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={launchCustomDrill}
                className="mt-2 w-full rounded-xl bg-[var(--app-accent)] py-3 text-sm font-bold text-slate-950 hover:opacity-90 transition"
              >
                Synthesize & Start Smart Drill
              </button>
            </div>
          </div>
        </div>
      )}


      <StudentChatWidget user={user} />
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Activity;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
        active
          ? 'bg-[var(--app-accent-soft)] font-bold text-[var(--app-accent)] border border-[var(--app-border)]'
          : 'text-[var(--app-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MobileItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Activity;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold ${
        active ? 'text-[var(--app-accent)]' : 'text-[var(--app-muted)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="theme-surface rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--app-muted)]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[var(--app-accent)]" />
      </div>
      <p className="mt-2.5 truncate text-2xl font-bold">{value}</p>
      <p className="mt-1 truncate text-[11px] text-[var(--app-muted)]">
        {hint}
      </p>
    </div>
  );
}
