'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, BookOpen, History, Trophy } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Study', icon: Activity },
  { href: '/quizzes', label: 'Tests', icon: Layers },
  { href: '/resources', label: 'Library', icon: BookOpen },
  { href: '/history', label: 'Results', icon: History },
  { href: '/leaderboard', label: 'Merit', icon: Trophy },
];

export default function StudentBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Student navigation" className="student-bottom-nav md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : ''}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
