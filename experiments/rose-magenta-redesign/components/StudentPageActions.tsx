'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import ThemeSelector from '@/components/ThemeSelector';

export default function StudentPageActions() {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <div className="student-page-actions">
      <ThemeSelector />
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Sign out of your account"
        title="Sign out"
        className="student-signout"
      >
        <LogOut aria-hidden="true" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
