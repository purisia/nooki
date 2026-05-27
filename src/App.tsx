import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { MonthPicker } from './components/MonthPicker';
import { Dashboard } from './components/Dashboard';
import { TabSwitcher } from './components/TabSwitcher';
import { FilterPanel } from './components/FilterPanel';
import { CritterCard } from './components/CritterCard';
import { Footer } from './components/Footer';
import { useDonations } from './lib/donations';
import {
  ALL_CRITTERS,
  checkIfNew,
  checkIfLeaving,
  getProgress,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [showRainOnly, setShowRainOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showLeavingOnly, setShowLeavingOnly] = useState(false);
  const [showUndonatedOnly, setShowUndonatedOnly] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('전체');

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

    if (showRainOnly) list = list.filter((item) => item.rainOnly);
    if (showNewOnly && selectedMonth)
      list = list.filter((item) => checkIfNew(item, selectedMonth));
    if (showLeavingOnly && selectedMonth)
      list = list.filter((item) => checkIfLeaving(item, selectedMonth));
    if (showUndonatedOnly) list = list.filter((item) => !donated[item.id]);

    if (selectedEnvironment !== 'all') {
      list = list.filter((item) => item.condition === selectedEnvironment);
    }

    if (activeTab !== 'seafood' && selectedLocation !== '전체') {
      list = list.filter((item) => item.location === selectedLocation);
    }

    return list;
  }, [
    activeTab,
    selectedMonth,
    searchQuery,
    showRainOnly,
    showNewOnly,
    showLeavingOnly,
    showUndonatedOnly,
    selectedEnvironment,
    selectedLocation,
    donated,
  ]);

  const progress = useMemo(
    () => getProgress(activeTab, selectedMonth, donated),
    [activeTab, selectedMonth, donated]
  );

  const filtersActive =
    showRainOnly ||
    showNewOnly ||
    showLeavingOnly ||
    showUndonatedOnly ||
    searchQuery !== '' ||
    selectedLocation !== '전체' ||
    selectedEnvironment !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setShowRainOnly(false);
    setShowNewOnly(false);
    setShowLeavingOnly(false);
    setShowUndonatedOnly(false);
    setSelectedLocation('전체');
    setSelectedEnvironment('all');
  };

  const switchTab = (tab: CritterCategory) => {
    setActiveTab(tab);
    setSelectedLocation('전체');
    setSelectedEnvironment('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Header user={user} authReady={authReady} />

      <main className="max-w-4xl mx-auto px-4 mt-6">
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
          showRainOnly={showRainOnly}
          onRainToggle={() => setShowRainOnly((v) => !v)}
          showNewOnly={showNewOnly}
          onNewToggle={() => setShowNewOnly((v) => !v)}
          showLeavingOnly={showLeavingOnly}
          onLeavingToggle={() => setShowLeavingOnly((v) => !v)}
          showUndonatedOnly={showUndonatedOnly}
          onUndonatedToggle={() => setShowUndonatedOnly((v) => !v)}
          selectedEnvironment={selectedEnvironment}
          onEnvironmentChange={setSelectedEnvironment}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
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
      </main>

      <Footer />
    </div>
  );
}

export default App;
