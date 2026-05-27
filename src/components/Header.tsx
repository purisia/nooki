import { AuthButton } from './AuthButton';
import type { User } from '../lib/firebase';

interface HeaderProps {
  user: User | null;
  authReady: boolean;
}

export function Header({ user, authReady }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <span className="text-4xl">🏝️</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                모동숲 올시즌 야생 수렵 도감
              </h1>
              <p className="text-emerald-100 text-xs mt-0.5">
                교배꽃 · 야자수 · 바위치기 · 출현 시기 전천후 매핑 카탈로그
              </p>
            </div>
          </div>
          <AuthButton user={user} authReady={authReady} />
        </div>
      </div>
    </header>
  );
}
