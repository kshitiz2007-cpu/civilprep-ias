'use client';

import BrandMark from '@/components/BrandMark';
import DailyContentCarousel from '@/components/DailyContentCarousel';
import StudentBottomNav from '@/components/StudentBottomNav';
import ThemeSelector from '@/components/ThemeSelector';
import {
  ArrowRight, BookOpen, CalendarDays, ChartNoAxesCombined, Clock3,
  FileQuestion, FileText, Flame, History, Layers, LibraryBig, LogOut,
  Play, RotateCcw, Sparkles, Target, Trophy, TrendingUp
} from 'lucide-react';

export type StudyQuiz = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  time_limit?: number;
  questions?: unknown[];
};

export type StudyAttempt = {
  id: string;
  quiz_id: string;
  quiz_title?: string;
  category?: string;
  score: number;
  correct?: number;
  wrong?: number;
  total?: number;
  completed_at?: string;
};

export type SubjectSignal = {
  subject: string;
  count: number;
  avg: number | null;
};

export type StudyRecommendation = {
  title: string;
  detail: string;
  subject: string;
  action: string;
};

type Props = {
  firstName: string;
  quizzes: StudyQuiz[];
  attempts: StudyAttempt[];
  resourceCount: number;
  meanScore: number;
  subjects: SubjectSignal[];
  recommendation: StudyRecommendation;
  focusSeconds: number;
  focusRunning: boolean;
  broadcastNotice?: string;
  onOpenQuiz: (id: string) => void;
  onOpenQuizzes: () => void;
  onOpenLibrary: () => void;
  onOpenResults: () => void;
  onOpenMerit: () => void;
  onOpenDrill: (subject?: string) => void;
  onToggleFocus: () => void;
  onResetFocus: () => void;
  onLogout: () => void;
};

const quickLinks = [
  { title: 'Test Arena', note: 'Practice & full mocks', icon: FileQuestion, key: 'tests' },
  { title: 'Study Library', note: 'Notes & compendiums', icon: LibraryBig, key: 'library' },
  { title: 'Evaluation Archive', note: 'Review past attempts', icon: History, key: 'results' },
  { title: 'Merit List', note: 'Compare your progress', icon: Trophy, key: 'merit' },
];

function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function formatAttemptDate(value?: string) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

export default function StudentStudyHome(props: Props) {
  const {
    firstName, quizzes, attempts, resourceCount, meanScore, subjects,
    recommendation, focusSeconds, focusRunning, broadcastNotice,
    onOpenQuiz, onOpenQuizzes, onOpenLibrary, onOpenResults, onOpenMerit,
    onOpenDrill, onToggleFocus, onResetFocus, onLogout,
  } = props;

  const evaluatedSubjects = subjects.filter((item) => item.count > 0 && item.avg !== null);
  const latestAttempts = attempts.slice(0, 3);
  const featuredQuizzes = quizzes.slice(0, 4);
  const totalQuestions = featuredQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);

  const openQuickLink = (key: string) => {
    if (key === 'tests') onOpenQuizzes();
    if (key === 'library') onOpenLibrary();
    if (key === 'results') onOpenResults();
    if (key === 'merit') onOpenMerit();
  };

  return (
    <div className="student-studio">
      <header className="studio-topbar">
        <div className="studio-brand">
          <BrandMark size={34} />
          <div>
            <strong>Gyankunj IAS</strong>
            <span>CIVIL SERVICES LEARNING STUDIO</span>
          </div>
        </div>
        <div className="studio-header-actions">
          <ThemeSelector compact />
          <button type="button" onClick={onLogout} className="studio-icon-button" aria-label="Sign out" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {broadcastNotice ? (
        <div className="studio-notice"><Sparkles size={16} /><span><strong>Academic notice</strong> · {broadcastNotice}</span></div>
      ) : null}

      <section className="studio-intro">
        <div>
          <p className="studio-overline">YOUR PERSONAL STUDY SPACE</p>
          <h1>Good to see you, <em>{firstName}.</em></h1>
          <p>Make the next focused session count. Your preparation, one deliberate step at a time.</p>
        </div>
        <div className="studio-edition-mark" aria-hidden="true">
          <span>GK</span><small>LEARN · RECALL · ADVANCE</small>
        </div>
      </section>

      <section className="studio-daily-section" aria-label="Daily learning">
        <div className="studio-section-heading">
          <div><p className="studio-overline">THE DAILY EDITION</p><h2>Today's learning desk</h2></div>
          <span className="studio-live-label"><i /> DAILY PRACTICE</span>
        </div>
        <DailyContentCarousel />
      </section>

      <section className="studio-quick-section">
        <div className="studio-section-heading">
          <div><p className="studio-overline">YOUR WORKSPACE</p><h2>Pick up where you need to</h2></div>
          <span className="studio-subtle-count">04 STUDY TOOLS</span>
        </div>
        <div className="studio-quick-grid">
          {quickLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <button type="button" className={`studio-quick-card tone-${index + 1}`} key={item.key} onClick={() => openQuickLink(item.key)}>
                <span className="studio-quick-icon"><Icon size={20} /></span>
                <span className="studio-quick-copy"><strong>{item.title}</strong><small>{item.note}</small></span>
                <ArrowRight className="studio-quick-arrow" size={16} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="studio-focus-grid">
        <article className="studio-recommendation">
          <div className="studio-card-topline"><span className="studio-overline">A USEFUL NEXT STEP</span><span className="studio-mini-icon"><Target size={17} /></span></div>
          <h2>{recommendation.title}</h2>
          <p>{recommendation.detail}</p>
          <button type="button" onClick={() => onOpenDrill(recommendation.subject)} className="studio-primary-action">
            {recommendation.action} <ArrowRight size={16} />
          </button>
          <small className="studio-data-note">Suggested from your recorded evaluations</small>
        </article>

        <article className="studio-focus-card">
          <div className="studio-card-topline"><span className="studio-overline">FOCUS SESSION</span><span className="studio-mini-icon"><Clock3 size={17} /></span></div>
          <div className="studio-timer">{formatDuration(focusSeconds)}</div>
          <p>{focusRunning ? 'A quiet session is in progress.' : 'A short, distraction-free study block.'}</p>
          <div className="studio-focus-actions">
            <button type="button" onClick={onToggleFocus}><Play size={14} /> {focusRunning ? 'Pause session' : 'Start 25 min'}</button>
            <button type="button" onClick={onResetFocus} aria-label="Reset focus timer"><RotateCcw size={15} /></button>
          </div>
        </article>
      </section>

      <section className="studio-record-section">
        <div className="studio-section-heading">
          <div><p className="studio-overline">YOUR PREPARATION RECORD</p><h2>Progress with evidence</h2></div>
          <button type="button" className="studio-text-link" onClick={onOpenResults}>Open archive <ArrowRight size={14} /></button>
        </div>
        <div className="studio-metric-grid">
          <article className="studio-metric"><span><Layers size={17} /> TESTS EVALUATED</span><strong>{attempts.length}</strong><small>Recorded attempts</small></article>
          <article className="studio-metric"><span><ChartNoAxesCombined size={17} /> MEAN SCORE</span><strong>{attempts.length ? `${meanScore}%` : '—'}</strong><small>{attempts.length ? 'Across recorded attempts' : 'Complete a test to begin'}</small></article>
          <article className="studio-metric"><span><FileQuestion size={17} /> ACTIVE PAPERS</span><strong>{quizzes.length}</strong><small>{totalQuestions ? `${totalQuestions} questions in featured papers` : 'Available practice papers'}</small></article>
          <article className="studio-metric"><span><BookOpen size={17} /> LIBRARY ITEMS</span><strong>{resourceCount}</strong><small>Published study resources</small></article>
        </div>
      </section>

      <section className="studio-review-grid">
        <article className="studio-panel">
          <div className="studio-section-heading compact">
            <div><p className="studio-overline">REVISION SIGNALS</p><h2>Subjects to revisit</h2></div>
            <Target size={19} />
          </div>
          {evaluatedSubjects.length ? (
            <div className="studio-subject-list">
              {evaluatedSubjects.slice().sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0)).slice(0, 4).map((item) => (
                <button type="button" key={item.subject} className="studio-subject-row" onClick={() => onOpenDrill(item.subject)}>
                  <span><strong>{item.subject}</strong><small>{item.count} evaluated {item.count === 1 ? 'test' : 'tests'}</small></span>
                  <span className="studio-subject-score">{item.avg}%</span>
                  <span className="studio-subject-track"><i style={{ width: `${Math.max(0, Math.min(100, item.avg ?? 0))}%` }} /></span>
                  <ArrowRight size={14} />
                </button>
              ))}
              <p className="studio-data-note">These are test averages, not syllabus completion scores.</p>
            </div>
          ) : (
            <div className="studio-empty-state"><Target size={23} /><strong>Your revision signals will appear here.</strong><p>Complete a subject-based evaluation to identify what deserves another look.</p></div>
          )}
        </article>

        <article className="studio-panel">
          <div className="studio-section-heading compact">
            <div><p className="studio-overline">RECENT ACTIVITY</p><h2>Latest evaluations</h2></div>
            <History size={19} />
          </div>
          {latestAttempts.length ? (
            <div className="studio-attempt-list">
              {latestAttempts.map((attempt) => (
                <div className="studio-attempt-row" key={attempt.id}>
                  <span className="studio-attempt-mark"><CheckIcon /></span>
                  <div><strong>{attempt.quiz_title || attempt.category || 'Practice evaluation'}</strong><small>{formatAttemptDate(attempt.completed_at)}{attempt.total ? ` · ${attempt.total} questions` : ''}</small></div>
                  <b>{Number(attempt.score || 0)}%</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="studio-empty-state"><History size={23} /><strong>Your first evaluation is the next milestone.</strong><p>Choose a paper from the Test Arena to create your preparation record.</p></div>
          )}
        </article>
      </section>

      <section className="studio-papers-section">
        <div className="studio-section-heading">
          <div><p className="studio-overline">CURATED PRACTICE</p><h2>Ready when you are</h2><p className="studio-section-desc">Choose a paper and move straight into practice.</p></div>
          <button type="button" className="studio-text-link" onClick={onOpenQuizzes}>All papers <ArrowRight size={14} /></button>
        </div>
        {featuredQuizzes.length ? (
          <div className="studio-paper-rail">
            {featuredQuizzes.map((quiz, index) => (
              <article className="studio-paper-card" key={quiz.id}>
                <div className="studio-paper-index">0{index + 1}</div>
                <span className="studio-paper-category">{quiz.category || 'GENERAL STUDIES'}</span>
                <h3>{quiz.title}</h3>
                <p>{quiz.description || 'A focused practice paper from your institutional test series.'}</p>
                <div className="studio-paper-meta"><span><FileQuestion size={13} /> {quiz.questions?.length ?? '—'} questions</span><span><Clock3 size={13} /> {quiz.time_limit || 60} min</span></div>
                <button type="button" onClick={() => onOpenQuiz(quiz.id)}>Open paper <ArrowRight size={15} /></button>
              </article>
            ))}
          </div>
        ) : (
          <div className="studio-empty-state"><BookOpen size={24} /><strong>No active papers are available yet.</strong><p>Your faculty team can publish papers to make them appear here.</p></div>
        )}
      </section>

      <footer className="studio-footer">
        <span>GYANKUNJ IAS</span><span>Built for thoughtful preparation.</span>
      </footer>
      <StudentBottomNav />
    </div>
  );
}

function CheckIcon() {
  return <TrendingUp size={16} aria-hidden="true" />;
}
