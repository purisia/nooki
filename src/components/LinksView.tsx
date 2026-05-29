import { ExternalLink } from 'lucide-react';

interface LinkItem {
  title: string;
  url: string;
  desc: string;
  emoji: string;
}

interface LinkGroup {
  heading: string;
  links: LinkItem[];
}

const GROUPS: LinkGroup[] = [
  {
    heading: '🌸 꽃 교배 도구',
    links: [
      {
        emoji: '🧪',
        title: 'Garden Science',
        url: 'https://gardenscience.ac/',
        desc: '유전자형 기반 꽃 교배 계산기 · 목표 색까지 교배 경로를 찾아줍니다.',
      },
      {
        emoji: '🧬',
        title: 'aiterusawato · 꽃 유전자형 표',
        url: 'https://aiterusawato.github.io/satogu/acnh/flowers/genotypes.html',
        desc: '8종 꽃의 유전자형→색상 데이터 원본 (게임 데이터마이닝).',
      },
    ],
  },
  {
    heading: '📚 데이터 출처',
    links: [
      {
        emoji: '📖',
        title: 'Nookipedia',
        url: 'https://nookipedia.com',
        desc: '도감 데이터 출처 (CC BY-SA 3.0).',
      },
      {
        emoji: '🌐',
        title: 'alexislours / ACNHAPI',
        url: 'https://github.com/alexislours/ACNHAPI',
        desc: '인게임 한국어(KRko) 명칭 로컬라이즈 데이터.',
      },
    ],
  },
];

export function LinksView() {
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div
          key={group.heading}
          className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200"
        >
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {group.heading}
          </h3>
          <div className="space-y-2">
            {group.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
              >
                <span className="text-xl leading-none mt-0.5">{link.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm group-hover:text-sky-700">
                      {link.title}
                    </span>
                    <ExternalLink
                      size={13}
                      className="text-slate-400 group-hover:text-sky-600 flex-shrink-0"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
