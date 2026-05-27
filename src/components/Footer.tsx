export function Footer() {
  return (
    <footer className="mt-12 bg-slate-200/50 border-t border-slate-200 text-slate-500 py-8 text-xs">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
        <p className="font-bold text-slate-600">🏝️ 동물의 숲 마스터 야생 수렵 도감</p>
        <p className="leading-relaxed max-w-xl mx-auto text-slate-400">
          본 도감 데이터베이스는 동물의 숲 북반구 공식 데이터 정보를 기저로
          설계되었습니다.
        </p>
        <div className="pt-2 text-[10px] text-slate-400">
          데이터 출처:{' '}
          <a
            href="https://nookipedia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-600"
          >
            Nookipedia
          </a>{' '}
          (CC BY-SA 3.0) · 한국어 명칭: 한국닌텐도 공식 가이드 / 인게임 도감 매핑
        </div>
      </div>
    </footer>
  );
}
