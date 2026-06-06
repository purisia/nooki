import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { MonthPicker } from './components/MonthPicker';
import { Dashboard } from './components/Dashboard';
import { TabSwitcher } from './components/TabSwitcher';
import { FilterPanel } from './components/FilterPanel';
import { CritterCard } from './components/CritterCard';
import { Footer } from './components/Footer';
import { LinksView } from './components/LinksView';
import { IslandGuide } from './components/IslandGuide';
import { FurnitureGuide } from './components/FurnitureGuide';
import { ActiveFiltersBar, type ActiveFilter } from './components/ActiveFiltersBar';
import { useDonations } from './lib/donations';
import {
  ALL_CRITTERS,
  checkIfNew,
  checkIfLeaving,
  FISH_SIZE_LABELS,
  formatMinPrice,
  getProgress,
  isAvailableNow,
  matchesMinPrice,
  normalizeFishSize,
  type Critter,
  type CritterCategory,
} from './lib/critterAvailability';

function App() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    now.getMonth() + 1
  );
  const [currentHour, setCurrentHour] = useState<number>(now.getHours());
  const [activeTab, setActiveTab] = useState<CritterCategory>('fish');
  const [view, setView] = useState<
    'catalog' | 'islands' | 'furniture' | 'links'
  >('catalog');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showLeavingOnly, setShowLeavingOnly] = useState(false);
  const [showUndonatedOnly, setShowUndonatedOnly] = useState(false);
  const [showAvailableNow, setShowAvailableNow] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('전체');
  const [selectedSize, setSelectedSize] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [sortBy, setSortBy] = useState<
    'number-asc' | 'number-desc' | 'price-desc' | 'price-asc'
  >('number-asc');

  const { donated, toggle, user, authReady } = useDonations();

  const filteredList = useMemo<Critter[]>(() => {
    let list = ALL_CRITTERS[activeTab] ?? [];

    if (selectedMonth) {
      list = list.filter((item) => item.months.includes(selectedMonth));
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    if (showNewOnly && selectedMonth)
      list = list.filter((item) => checkIfNew(item, selectedMonth));
    if (showLeavingOnly && selectedMonth)
      list = list.filter((item) => checkIfLeaving(item, selectedMonth));
    if (showUndonatedOnly) list = list.filter((item) => !donated[item.id]);
    if (showAvailableNow)
      list = list.filter((item) => isAvailableNow(item.time, currentHour));

    if (activeTab !== 'seafood' && selectedLocation !== '전체') {
      list = list.filter((item) => item.location === selectedLocation);
    }

    if (activeTab === 'fish' && selectedSize !== 'all') {
      list = list.filter(
        (item) => normalizeFishSize(item.size)?.key === selectedSize
      );
    }

    if (minPrice > 0) {
      list = list.filter((item) => matchesMinPrice(item.price, minPrice));
    }

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        case 'number-desc':
          return (b.number ?? -1) - (a.number ?? -1);
        case 'number-asc':
        default:
          // number 없는 entry(보존된 비-Cargo 종)는 맨 뒤로.
          return (a.number ?? Infinity) - (b.number ?? Infinity);
      }
    });

    return list;
  }, [
    activeTab,
    selectedMonth,
    searchQuery,
    showNewOnly,
    showLeavingOnly,
    showUndonatedOnly,
    showAvailableNow,
    currentHour,
    selectedLocation,
    selectedSize,
    minPrice,
    sortBy,
    donated,
  ]);

  const progress = useMemo(
    () => getProgress(activeTab, selectedMonth, donated),
    [activeTab, selectedMonth, donated]
  );

  const filtersActive =
    showNewOnly ||
    showLeavingOnly ||
    showUndonatedOnly ||
    showAvailableNow ||
    searchQuery !== '' ||
    selectedLocation !== '전체' ||
    selectedSize !== 'all' ||
    minPrice > 0;

  const resetFilters = () => {
    setSearchQuery('');
    setShowNewOnly(false);
    setShowLeavingOnly(false);
    setShowUndonatedOnly(false);
    setShowAvailableNow(false);
    setSelectedLocation('전체');
    setSelectedSize('all');
    setMinPrice(0);
  };

  const switchTab = (tab: CritterCategory) => {
    setActiveTab(tab);
    setSelectedLocation('전체');
    setSelectedSize('all');
    setMinPrice(0);
  };

  const filterPanelProps = {
    activeTab,
    selectedMonth,
    searchQuery,
    onSearchChange: setSearchQuery,
    showNewOnly,
    onNewToggle: () => setShowNewOnly((v) => !v),
    showLeavingOnly,
    onLeavingToggle: () => setShowLeavingOnly((v) => !v),
    showUndonatedOnly,
    onUndonatedToggle: () => setShowUndonatedOnly((v) => !v),
    showAvailableNow,
    onAvailableNowToggle: () => setShowAvailableNow((v) => !v),
    selectedLocation,
    onLocationChange: setSelectedLocation,
    selectedSize,
    onSizeChange: setSelectedSize,
    minPrice,
    onMinPriceChange: setMinPrice,
    sortBy,
    onSortByChange: setSortBy,
  };

  const activeFilters: ActiveFilter[] = [];
  if (showAvailableNow)
    activeFilters.push({
      key: 'now',
      label: '⏰ 지금 출현',
      onClear: () => setShowAvailableNow(false),
    });
  if (showUndonatedOnly)
    activeFilters.push({
      key: 'undonated',
      label: '🏛️ 미기증',
      onClear: () => setShowUndonatedOnly(false),
    });
  if (showNewOnly && selectedMonth)
    activeFilters.push({
      key: 'new',
      label: `🆕 ${selectedMonth}월 신규`,
      onClear: () => setShowNewOnly(false),
    });
  if (showLeavingOnly && selectedMonth)
    activeFilters.push({
      key: 'leaving',
      label: `⚠️ ${selectedMonth}월 퇴장`,
      onClear: () => setShowLeavingOnly(false),
    });
  if (searchQuery.trim() !== '')
    activeFilters.push({
      key: 'search',
      label: `🔍 ${searchQuery.trim()}`,
      onClear: () => setSearchQuery(''),
    });
  if (activeTab !== 'seafood' && selectedLocation !== '전체')
    activeFilters.push({
      key: 'location',
      label: `📍 ${selectedLocation}`,
      onClear: () => setSelectedLocation('전체'),
    });
  if (activeTab === 'fish' && selectedSize !== 'all')
    activeFilters.push({
      key: 'size',
      label: `🐟 ${FISH_SIZE_LABELS[selectedSize] ?? selectedSize}`,
      onClear: () => setSelectedSize('all'),
    });
  if (minPrice > 0)
    activeFilters.push({
      key: 'price',
      label: `💰 ${formatMinPrice(minPrice)}`,
      onClear: () => setMinPrice(0),
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Header user={user} authReady={authReady} />

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => setView('catalog')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border text-xs sm:text-sm ${
              view === 'catalog'
                ? 'bg-slate-800 text-white border-transparent shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            📖 수렵 도감
          </button>
          <button
            onClick={() => setView('islands')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border text-xs sm:text-sm ${
              view === 'islands'
                ? 'bg-emerald-700 text-white border-transparent shadow-sm shadow-emerald-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            🏝️ 마일섬
          </button>
          <button
            onClick={() => setView('furniture')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border text-xs sm:text-sm ${
              view === 'furniture'
                ? 'bg-amber-600 text-white border-transparent shadow-sm shadow-amber-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            🪑 기능성 가구
          </button>
          <button
            onClick={() => setView('links')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border text-xs sm:text-sm ${
              view === 'links'
                ? 'bg-sky-600 text-white border-transparent shadow-sm shadow-sky-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            🔗 관련 링크
          </button>
        </div>

        {view === 'links' ? (
          <LinksView />
        ) : view === 'islands' ? (
          <IslandGuide />
        ) : view === 'furniture' ? (
          <FurnitureGuide />
        ) : (
          <>
        <MonthPicker
          selectedMonth={selectedMonth}
          onChange={(m) => {
            setSelectedMonth(m);
            setShowNewOnly(false);
            setShowLeavingOnly(false);
          }}
        />

        <Dashboard
          currentHour={currentHour}
          onHourChange={setCurrentHour}
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          progress={progress}
        />

        <TabSwitcher activeTab={activeTab} onChange={switchTab} />

        <FilterPanel {...filterPanelProps} />

        <div className="mb-4 flex justify-between items-center px-1">
          <p className="text-xs font-semibold text-slate-500">
            {selectedMonth ? `${selectedMonth}월 활동 생물` : '연간 전체 시즌'} -
            총{' '}
            <span className="text-emerald-700 font-bold">
              {filteredList.length}
            </span>
            종 매칭됨
          </p>
          {filtersActive && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:underline font-semibold"
            >
              필터 모두 초기화
            </button>
          )}
        </div>

        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredList.map((critter) => (
              <CritterCard
                key={critter.id}
                critter={critter}
                currentHour={currentHour}
                selectedMonth={selectedMonth}
                isDonated={!!donated[critter.id]}
                onToggleDonate={toggle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="font-bold text-slate-700">
              해당 조건에 부합하는 생물이 없습니다.
            </p>
          </div>
        )}
          </>
        )}
      </main>

      <Footer />

      {view === 'catalog' && (
        <ActiveFiltersBar
          filters={activeFilters}
          onClearAll={resetFilters}
          onOpenFilters={() => setFilterSheetOpen(true)}
        />
      )}

      {view === 'catalog' && filterSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setFilterSheetOpen(false)}
          />
          <div className="relative w-full max-w-4xl bg-slate-50 rounded-t-3xl shadow-xl max-h-[85vh] flex flex-col">
            <div className="px-5 pt-3 pb-2 flex-shrink-0 bg-white rounded-t-3xl border-b border-slate-100">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  🎚️ <span>필터 설정</span>
                </h3>
                <div className="flex items-center gap-3">
                  {filtersActive && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-rose-500 font-semibold"
                    >
                      초기화
                    </button>
                  )}
                  <button
                    onClick={() => setFilterSheetOpen(false)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full"
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              <FilterPanel {...filterPanelProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
