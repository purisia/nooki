import { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import {
  firebaseEnabled,
  signInWithGoogle,
  signOutUser,
  type User,
} from '../lib/firebase';

interface AuthButtonProps {
  user: User | null;
  authReady: boolean;
}

export function AuthButton({ user, authReady }: AuthButtonProps) {
  const [busy, setBusy] = useState(false);

  if (!firebaseEnabled) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-800/40 border border-white/20 px-3 py-1 rounded-full text-xs">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-300"></span>
        <span>로컬 쿠키 모드</span>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-800/40 border border-white/20 px-3 py-1 rounded-full text-xs">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-300 animate-pulse"></span>
        <span>로그인 상태 확인 중...</span>
      </div>
    );
  }

  if (user) {
    const name = user.displayName ?? user.email ?? '익명';
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-emerald-800/40 border border-white/20 px-3 py-1.5 rounded-full text-xs">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="w-5 h-5 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="font-semibold max-w-[140px] truncate">{name}</span>
        </div>
        <button
          onClick={async () => {
            setBusy(true);
            try {
              await signOutUser();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-50"
        >
          <LogOut size={12} />
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await signInWithGoogle();
        } catch (e) {
          console.error(e);
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className="flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm disabled:opacity-50"
    >
      <LogIn size={14} />
      Google 로그인
    </button>
  );
}
