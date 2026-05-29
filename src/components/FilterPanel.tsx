import {
  Search,
  Filter,
  CloudRain,
  Sparkles,
  HelpCircle,
  Flower2,
  Sprout,
  Trash2,
  Anchor,
  Circle,
} from 'lucide-react';
import type { CritterCategory } from '../lib/critterAvailability';
import { getLocations, getFishSizes } from '../lib/critterAvailability';

interface FilterPanelProps {
  activeTab: CritterCategory;
  selectedMonth: number | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showRainOnly: boolean;
  onRainToggle: () => void;
  showNewOnly: boolean;
  onNewToggle: () => void;
  showLeavingOnly: boolean;
  onLeavingToggle: () => void;
  showUndonatedOnly: boolean;
  onUndonatedToggle: () => void;
  selectedEnvironment: string;
  onEnvironmentChange: (e: string) => void;
  selectedLocation: string;
  onLocationChange: (l: string) => void;
  selectedSize: string;
  onSizeChange: (s: string) => void;
}

export function FilterPanel(props: FilterPanelProps) {
  const {
    activeTab,
    selectedMonth,
    searchQuery,
    onSearchChange,
    showRainOnly,
    onRainToggle,
    showNewOnly,
    onNewToggle,
    showLeavingOnly,
    onLeavingToggle,
    showUndonatedOnly,
    onUndonatedToggle,
    selectedEnvironment,
    onEnvironmentChange,
    selectedLocation,
    onLocationChange,
    selectedSize,
    onSizeChange,
  } = props;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-slate-200 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Filter size={14} />
          <span>수렵 환경 및 특수 아이템 기믹 필터링</span>
        </h3>

        <div className="flex flex-wrap gap-1.5">
          <EnvBtn
            active={selectedEnvironment === 'all'}
            onClick={() => onEnvironmentChange('all')}
            activeClass="bg-slate-800 text-white"
            idleClass="bg-slate-100 text-slate-600 hover:bg-slate-200"
            label="전체 수렵조건"
          />

          {activeTab === 'bugs' && (
            <>
              <EnvBtn
                active={selectedEnvironment === 'hybridFlower'}
                onClick={() => onEnvironmentChange('hybridFlower')}
                activeClass="bg-purple-600 text-white shadow-sm"
                idleClass="bg-purple-50 text-purple-700 hover:bg-purple-100"
                label={
                  <>
                    <Flower2 size={12} /> 🌺 교배꽃 근처
                  </>
                }
              />
              <EnvBtn
                active={selectedEnvironment === 'stump'}
                onClick={() => onEnvironmentChange('stump')}
                activeClass="bg-amber-700 text-white shadow-sm"
                idleClass="bg-amber-50 text-amber-800 hover:bg-amber-100"
                label={
                  <>
                    <Sprout size={12} /> 🪵 그루터기 한정
                  </>
                }
              />
              <EnvBtn
                active={selectedEnvironment === 'palmTree'}
                onClick={() => onEnvironmentChange('palmTree')}
                activeClass="bg-orange-600 text-white shadow-sm"
                idleClass="bg-orange-50 text-orange-700 hover:bg-orange-100"
                label="🌴 야자수 나무"
              />
              <EnvBtn
                active={selectedEnvironment === 'hitRock'}
                onClick={() => onEnvironmentChange('hitRock')}
                activeClass="bg-slate-600 text-white shadow-sm"
                idleClass="bg-slate-50 text-slate-700 hover:bg-slate-100"
                label="🪨 바위치기"
              />
              <EnvBtn
                active={selectedEnvironment === 'rottenTurnip'}
                onClick={() => onEnvironmentChange('rottenTurnip')}
                activeClass="bg-rose-600 text-white shadow-sm"
                idleClass="bg-rose-50 text-rose-700 hover:bg-rose-100"
                label="🥕 썩은 무"
              />
              <EnvBtn
                active={selectedEnvironment === 'trash'}
                onClick={() => onEnvironmentChange('trash')}
                activeClass="bg-slate-700 text-white shadow-sm"
                idleClass="bg-slate-50 text-slate-700 hover:bg-slate-100"
                label={
                  <>
                    <Trash2 size={12} /> 🗑️ 쓰레기
                  </>
                }
              />
            </>
          )}

          {activeTab === 'fish' && (
            <>
              <EnvBtn
                active={selectedEnvironment === 'pier'}
                onClick={() => onEnvironmentChange('pier')}
                activeClass="bg-sky-700 text-white shadow-sm"
                idleClass="bg-sky-50 text-sky-800 hover:bg-sky-100"
                label={
                  <>
                    <Anchor size={12} /> ⚓ 부두(데크)
                  </>
                }
              />
              <EnvBtn
                active={selectedEnvironment === 'waterfall'}
                onClick={() => onEnvironmentChange('waterfall')}
                activeClass="bg-blue-600 text-white shadow-sm"
                idleClass="bg-blue-50 text-blue-700 hover:bg-blue-100"
                label="💧 절벽 위 폭포"
              />
              <EnvBtn
                active={selectedEnvironment === 'riverMouth'}
                onClick={() => onEnvironmentChange('riverMouth')}
                activeClass="bg-cyan-600 text-white shadow-sm"
                idleClass="bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                label="🌊 강 하구"
              />
              <EnvBtn
                active={selectedEnvironment === 'fin'}
                onClick={() => onEnvironmentChange('fin')}
                activeClass="bg-indigo-600 text-white shadow-sm"
                idleClass="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                label="🦈 등지느러미"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-100">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="생물명 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {activeTab !== 'seafood' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              원래 장소:
            </span>
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {getLocations(activeTab).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'fish' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              🐟 그림자 크기:
            </span>
            <select
              value={selectedSize}
              onChange={(e) => onSizeChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">전체 크기</option>
              {getFishSizes().map((size) => (
                <option key={size.key} value={size.key}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={onRainToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            showRainOnly
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CloudRain size={14} />
          🌧️ 날씨(비/눈) 기후 한정
        </button>

        <button
          onClick={onUndonatedToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            showUndonatedOnly
              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Circle size={14} />
          🏛️ 미기증만 보기
        </button>

        {selectedMonth && (
          <>
            <button
              onClick={onNewToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                showNewOnly
                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={14} />
              🆕 {selectedMonth}월 신규 등장
            </button>

            <button
              onClick={onLeavingToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                showLeavingOnly
                  ? 'bg-rose-100 text-rose-800 border-2 border-rose-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HelpCircle size={14} />
              ⚠️ {selectedMonth}월 지나면 퇴장
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EnvBtn({
  active,
  onClick,
  activeClass,
  idleClass,
  label,
}: {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  idleClass: string;
  label: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
        active ? activeClass : idleClass
      }`}
    >
      {label}
    </button>
  );
}
