import { Calendar } from 'lucide-react';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface MonthPickerProps {
  selectedMonth: number | null;
  onChange: (month: number | null) => void;
}

export function MonthPicker({ selectedMonth, onChange }: MonthPickerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-slate-200">
      <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <Calendar size={16} className="text-emerald-600" />
        <span>수렵하고 있는 활동 월(Month)을 지정하세요</span>
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5">
        <button
          onClick={() => onChange(null)}
          className={`py-2 px-1 text-center font-bold text-sm rounded-xl transition-all ${
            selectedMonth === null
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          전체월
        </button>
        {MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`py-2 px-1 text-center font-bold text-sm rounded-xl transition-all ${
              selectedMonth === m
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {m}월
          </button>
        ))}
      </div>
    </div>
  );
}
