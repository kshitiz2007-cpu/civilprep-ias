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
import BrandMark from '@/components/BrandMark';
import StudentChatWidget from '@/components/StudentChatWidget';
import DailyContentCarousel from '@/components/DailyContentCarousel';
import ThemeSelector from '@/components/ThemeSelector';
import StudentBottomNav from '@/components/StudentBottomNav';

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
        {/* Top Header */}
        <header className="dashboard-header mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="sanctuary-brand-lockup">
            <BrandMark size={18} />
            <div>
              <p className="font-serif text-base font-bold leading-none text-[#552334]">Gyankunj IAS</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#987b76]">Civil Services Preparation</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowDrillModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3.5 py-2 text-xs font-bold text-slate-950 hover:opacity-90 transition"
            >
              <Sliders className="h-3.5 w-3.5" /> Custom Smart Drill
            </button>
            <ThemeSelector />
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out of your account"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--app-muted)] shadow-sm transition hover:border-[var(--app-accent)] hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Optional Institutional Broadcast Notice */}
        {broadcastNotice && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-accent-soft)] px-4 py-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--app-accent)]" />
              <span>
                <strong>Academic Notice:</strong> {broadcastNotice}
              </span>
            </div>
          </div>
        )}

        {/* Rose Editorial Student Homepage */}
        <section className="sanctuary-welcome mb-5">
          <p className="sanctuary-eyebrow">CIVIL SERVICES PREPARATION</p>
          <h2>Steady progress, <em>{firstName}.</em></h2>
          <p>Consistent study moves you closer to the Civil Services.</p>
        </section>

        <section className="sanctuary-mission mb-5">
          <div className="sanctuary-mission-copy">
            <div className="sanctuary-mission-kicker">
              <span>TODAY'S MISSION</span>
              <span className="sanctuary-target"><Target size={14}/> Target · 2 hrs</span>
            </div>
            <h2>Learn something today</h2>
            <div className="sanctuary-pills">
              <span>Topic</span><span>Question</span><span>MCQ</span>
            </div>
            <button onClick={() => router.push(quizzes[0] ? `/quiz/${quizzes[0].id}` : '/quizzes')} className="sanctuary-gold-button">
              Start Daily Practice <ArrowRight size={17}/>
            </button>
          </div>
          <div className="sanctuary-books-art" aria-hidden="true">
            <span className="sanctuary-book book-one">POLITY</span>
            <span className="sanctuary-book book-two">ECONOMY</span>
            <span className="sanctuary-book book-three">HISTORY</span>
            <span className="sanctuary-globe">◎</span>
          </div>
        </section>

        <section className="sanctuary-duo-grid mb-5">
          <article className="sanctuary-paper-card">
            <div className="sanctuary-card-heading"><Layers/><h3>Preparation Progress</h3><ArrowRight/></div>
            <div className="sanctuary-big-number">{attempts.length ? `${average}%` : '—'}</div>
            <p className="sanctuary-muted">{attempts.length} evaluated attempts</p>
            <div className="sanctuary-progress-track"><span style={{width:`${Math.max(0,Math.min(100,average))}%`}}/></div>
            <p className="sanctuary-footnote">Mean score across recorded evaluations</p>
          </article>
          <article className="sanctuary-paper-card">
            <div className="sanctuary-card-heading"><Target/><h3>Revision Radar</h3><ArrowRight/></div>
            <div className="sanctuary-radar-wrap">
              <div className="sanctuary-radar-ring"><strong>{revisionRadar.needsRevision.length}</strong><span>Topics to revisit</span></div>
            </div>
            <p className="sanctuary-muted">{revisionRadar.untested.length} GS pillars not yet assessed</p>
          </article>
        </section>

        <section className="sanctuary-editorial mb-5">
          <div className="sanctuary-editorial-copy">
            <p className="sanctuary-eyebrow">CURRENT AFFAIRS EDITORIAL</p>
            <h2>Master accuracy, statement deduction &amp; 50-50 EV before speed.</h2>
            <p>In UPSC Prelims, avoid unnecessary negative guesses using structured elimination.</p>
            <div className="sanctuary-actions">
              <button onClick={() => router.push('/quiz/upsc-gs1-polity-01')}>Launch Polity Simulator <ArrowRight size={16}/></button>
              <button className="secondary" onClick={() => setShowDrillModal(true)}><Sliders size={15}/> Build Custom Drill</button>
            </div>
          </div>
          <div className="sanctuary-parliament-art" aria-hidden="true"><Landmark size={104}/><span>भारत</span></div>
        </section>

        <section className="sanctuary-stat-grid mb-5">
          <div className="sanctuary-stat"><BookOpen/><span>Tests Evaluated</span><strong>{attempts.length}</strong></div>
          <div className="sanctuary-stat"><TrendingUp/><span>Mean Score</span><strong>{attempts.length ? `${average}%` : '—'}</strong></div>
          <div className="sanctuary-stat"><Layers/><span>Active Test Papers</span><strong>{quizzes.length}</strong></div>
          <div className="sanctuary-stat"><FileText/><span>Study Compendiums</span><strong>{resourceCount}</strong></div>
        </section>

        <section className="sanctuary-duo-grid mb-5">
          <article className="sanctuary-paper-card">
            <div className="sanctuary-card-heading"><Target/><h3>Topics to Revisit</h3><ArrowRight/></div>
            <div className="sanctuary-topic-list">
              {revisionRadar.needsRevision.length ? revisionRadar.needsRevision.slice(0,3).map(item => (
                <div className="sanctuary-topic-row" key={item.subject}>
                  <strong>{item.subject}</strong><span className="sanctuary-topic-bar"><i style={{width:`${item.avg ?? 0}%`}}/></span><b>{item.avg}%</b>
                </div>
              )) : <p className="sanctuary-muted">Complete an evaluated test to generate your revision priorities.</p>}
            </div>
          </article>
          <article className="sanctuary-paper-card">
            <div className="sanctuary-card-heading"><TrendingUp/><h3>Performance Snapshot</h3><ArrowRight/></div>
            <p className="sanctuary-muted">Recent evaluations · score (%)</p>
            {recentScores.length ? <div className="sanctuary-bars">{recentScores.slice(-6).map(a => <div key={a.id}><span>{a.score}</span><i style={{height:`${Math.max(8,Math.min(100,Number(a.score)||0))}%`}}/></div>)}</div> : <p className="sanctuary-empty-chart">Your performance chart will appear after your first evaluation.</p>}
          </article>
        </section>

        <section className="sanctuary-paper-card sanctuary-recommended mb-5">
          <div className="sanctuary-card-heading"><FileText/><div><h3>Recommended Tests</h3><p>Structured practice with UPSC's latest pattern.</p></div><button onClick={() => router.push('/quizzes')}>View All <ArrowRight size={14}/></button></div>
          <div className="sanctuary-test-list">
            {quizzes.slice(0,3).map(quiz => (
              <article className="sanctuary-test-row" key={quiz.id}>
                <span className="sanctuary-test-icon"><FileText/></span>
                <div className="sanctuary-test-copy"><strong>{quiz.title}</strong><span>{quiz.category || 'General Studies'} · {Array.isArray(quiz.questions) ? quiz.questions.length : 'Practice'} Questions</span></div>
                <button onClick={() => router.push(`/quiz/${quiz.id}`)}>Start Test <ArrowRight size={14}/></button>
              </article>
            ))}
          </div>
        </section>

        <section className="sanctuary-daily-content mb-5">
          <DailyContentCarousel />
        </section>

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

      {/* Mobile Bottom Navigation */}
      <StudentBottomNav />


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
