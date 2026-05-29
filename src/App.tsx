import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { MonthPicker } from './components/MonthPicker';
import { Dashboard } from './components/Dashboard';
import { TabSwitcher } from './components/TabSwitcher';
import { FilterPanel } from './components/FilterPanel';
import { CritterCard } from './components/CritterCard';
import { Footer } from './components/Footer';
import { LinksView } from './components/LinksView';
import { useDonations } from './lib/donations';
import {
  ALL_CRITTERS,
  checkIfNew,
  checkIfLeaving,
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
  const [view, setView] = useState<'catalog' | 'links'>('catalog');

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Header user={user} authReady={authReady} />

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setView('catalog')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
              view === 'catalog'
                ? 'bg-slate-800 text-white border-transparent shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            📖 수렵 도감
          </button>
          <button
            onClick={() => setView('links')}
            className={`py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
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

        <FilterPanel
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showNewOnly={showNewOnly}
          onNewToggle={() => setShowNewOnly((v) => !v)}
          showLeavingOnly={showLeavingOnly}
          onLeavingToggle={() => setShowLeavingOnly((v) => !v)}
          showUndonatedOnly={showUndonatedOnly}
          onUndonatedToggle={() => setShowUndonatedOnly((v) => !v)}
          showAvailableNow={showAvailableNow}
          onAvailableNowToggle={() => setShowAvailableNow((v) => !v)}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

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
    </div>
  );
}

export default App;
