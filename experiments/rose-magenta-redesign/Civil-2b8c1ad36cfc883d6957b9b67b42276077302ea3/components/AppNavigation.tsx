'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, LibraryBig, Trophy, Sparkles } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/quizzes', label: 'Practice', icon: BookOpen },
  { href: '/resources', label: 'Library', icon: LibraryBig },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
];

export default function AppNavigation() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/admin')) return null;

  return (
    <>
      <header className="app-topbar">
        <Link href="/dashboard" className="app-brand" aria-label="CivilPrep home">
          <span className="app-brand-mark"><Sparkles size={18} /></span>
          <span><strong>CivilPrep</strong><small>GYANKUNJ ACADEMY</small></span>
        </Link>
        <nav className="app-desktop-nav" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return <Link key={href} href={href} className={active ? 'app-nav-link active' : 'app-nav-link'}><Icon size={17}/>{label}</Link>;
          })}
        </nav>
        <span className="app-focus-chip"><span/> Your study space</span>
      </header>
      <nav className="app-mobile-nav" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return <Link key={href} href={href} className={active ? 'app-mobile-link active' : 'app-mobile-link'}><Icon size={19}/><span>{label}</span></Link>;
        })}
      </nav>
    </>
  );
}
