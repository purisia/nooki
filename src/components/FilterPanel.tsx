import { useState } from 'react';
import { Search, Sparkles, HelpCircle, Circle, ChevronDown } from 'lucide-react';
import type { CritterCategory } from '../lib/critterAvailability';
import {
  getLocations,
  getFishSizes,
  formatMinPrice,
  PRICE_MAX,
  PRICE_STEP,
} from '../lib/critterAvailability';
import { LocationSheet } from './LocationSheet';

interface FilterPanelProps {
  activeTab: CritterCategory;
  selectedMonth: number | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showNewOnly: boolean;
  onNewToggle: () => void;
  showLeavingOnly: boolean;
  onLeavingToggle: () => void;
  showUndonatedOnly: boolean;
  onUndonatedToggle: () => void;
  selectedLocation: string;
  onLocationChange: (l: string) => void;
  selectedSize: string;
  onSizeChange: (s: string) => void;
  minPrice: number;
  onMinPriceChange: (p: number) => void;
  sortBy: 'number-asc' | 'number-desc' | 'price-desc' | 'price-asc';
  onSortByChange: (
    s: 'number-asc' | 'number-desc' | 'price-desc' | 'price-asc'
  ) => void;
}

export function FilterPanel(props: FilterPanelProps) {
  const {
    activeTab,
    selectedMonth,
    searchQuery,
    onSearchChange,
    showNewOnly,
    onNewToggle,
    showLeavingOnly,
    onLeavingToggle,
    showUndonatedOnly,
    onUndonatedToggle,
    selectedLocation,
    onLocationChange,
    selectedSize,
    onSizeChange,
    minPrice,
    onMinPriceChange,
    sortBy,
    onSortByChange,
  } = props;

  const locations = activeTab !== 'seafood' ? getLocations(activeTab) : [];
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-slate-200 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
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

      {locations.length > 1 && (
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setLocationSheetOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-sm"
          >
            <span className="flex items-center gap-1.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
              📍 출현 장소
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`font-bold ${
                  selectedLocation === '전체' ? 'text-slate-500' : 'text-emerald-700'
                }`}
              >
                {selectedLocation}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </span>
          </button>

          <LocationSheet
            open={locationSheetOpen}
            onClose={() => setLocationSheetOpen(false)}
            category={activeTab}
            locations={locations}
            selected={selectedLocation}
            onSelect={onLocationChange}
          />
        </div>
      )}

      <div className="pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center mb-2 gap-3">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            💰 <span>최소 판매가</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                onSortByChange(
                  e.target.value as
                    | 'number-asc'
                    | 'number-desc'
                    | 'price-desc'
                    | 'price-asc'
                )
              }
              className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="number-asc">정렬: 도감 # ↑</option>
              <option value="number-desc">정렬: 도감 # ↓</option>
              <option value="price-desc">정렬: 가격 ↓</option>
              <option value="price-asc">정렬: 가격 ↑</option>
            </select>
            <span className="text-xs bg-slate-50 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
              {formatMinPrice(minPrice)}
            </span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={minPrice}
          onChange={(e) => onMinPriceChange(parseInt(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-0.5">
          <span>전체</span>
          <span>5,000</span>
          <span>10,000</span>
          <span>15,000벨+</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
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
