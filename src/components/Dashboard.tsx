import { Clock, CheckCircle } from 'lucide-react';
import type { CritterCategory, Progress } from '../lib/critterAvailability';

interface DashboardProps {
  currentHour: number;
  onHourChange: (h: number) => void;
  activeTab: CritterCategory;
  selectedMonth: number | null;
  progress: Progress;
}

const TAB_LABEL: Record<CritterCategory, string> = {
  bugs: '곤충',
  fish: '물고기',
  seafood: '해산물',
};

export function Dashboard({
  currentHour,
  onHourChange,
  activeTab,
  selectedMonth,
  progress,
}: DashboardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock size={16} className="text-emerald-600" />
              <span>하루 중 활동 시간 탐색</span>
            </label>
            <span className="text-xs bg-slate-50 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
              {currentHour.toString().padStart(2, '0')}:00 시 기준
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={currentHour}
            onChange={(e) => onHourChange(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 px-1">
            <span>자정</span>
            <span>아침</span>
            <span>정오</span>
            <span>저녁</span>
            <span>야간</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>
                {selectedMonth ? `${selectedMonth}월` : '전체 시즌'} {TAB_LABEL[activeTab]} 도감 달성률
              </span>
            </span>
            <span className="text-sm font-bold text-emerald-700">
              {progress.count} / {progress.total} 종 ({progress.percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
