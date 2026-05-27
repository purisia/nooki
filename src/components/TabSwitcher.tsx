import { Bug, Fish, Waves } from 'lucide-react';
import type { CritterCategory } from '../lib/critterAvailability';

interface TabSwitcherProps {
  activeTab: CritterCategory;
  onChange: (tab: CritterCategory) => void;
}

const TABS: { id: CritterCategory; label: string; icon: typeof Bug }[] = [
  { id: 'bugs', label: '🐛 곤충', icon: Bug },
  { id: 'fish', label: '🐟 물고기', icon: Fish },
  { id: 'seafood', label: '🤿 해산물', icon: Waves },
];

export function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`py-3 px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all shadow-sm border ${
            activeTab === id
              ? 'bg-emerald-700 text-white border-transparent shadow-emerald-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <Icon size={18} />
          <span className="text-xs sm:text-sm md:text-base">{label}</span>
        </button>
      ))}
    </div>
  );
}
