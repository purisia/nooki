import {
  CheckCircle,
  Circle,
  Clock,
  MapPin,
  Coins,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import type { Critter } from '../lib/critterAvailability';
import {
  isAvailableNow,
  checkIfNew,
  checkIfLeaving,
  normalizeFishSize,
  rarityMeta,
} from '../lib/critterAvailability';

interface CritterCardProps {
  critter: Critter;
  currentHour: number;
  selectedMonth: number | null;
  isDonated: boolean;
  onToggleDonate: (id: string) => void;
}

export function CritterCard({
  critter,
  currentHour,
  selectedMonth,
  isDonated,
  onToggleDonate,
}: CritterCardProps) {
  const activeNow = isAvailableNow(critter.time, currentHour);
  const isNew = checkIfNew(critter, selectedMonth);
  const isLeaving = checkIfLeaving(critter, selectedMonth);
  const fishSize = normalizeFishSize(critter.size);
  const sizeLabel =
    fishSize && fishSize.key !== 'unknown'
      ? `${fishSize.label}${fishSize.hasFin ? ' · 등지느러미' : ''}`
      : critter.size;
  const rarity = rarityMeta(critter.rarity);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isDonated
          ? 'border-emerald-300 bg-emerald-50/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {critter.image && (
              <img
                src={critter.image}
                alt={critter.name}
                loading="lazy"
                className="w-11 h-11 object-contain rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <h3 className="text-base font-bold text-slate-800">{critter.name}</h3>
            {typeof critter.number === 'number' && (
              <span className="text-[10px] font-semibold text-slate-400">
                #{critter.number}
              </span>
            )}
            {rarity && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${rarity.badgeClass}`}
              >
                ✨ {rarity.label}
              </span>
            )}
            {critter.needsKoreanName && (
              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                ⚠️ 영문명
              </span>
            )}
            {isNew && (
              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                🆕 신규
              </span>
            )}
            {isLeaving && (
              <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                ⚠️ 막차
              </span>
            )}
            {critter.rainOnly && (
              <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                🌧️ 비/눈
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleDonate(critter.id)}
            className="text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {isDonated ? (
              <span className="flex items-center text-xs text-emerald-600 font-medium bg-emerald-100 px-2.5 py-1 rounded-full gap-1">
                <CheckCircle size={14} /> 박물관 기증됨
              </span>
            ) : (
              <span className="flex items-center text-xs text-slate-400 hover:bg-slate-100 px-2.5 py-1 rounded-full gap-1">
                <Circle size={14} /> 미기증
              </span>
            )}
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mt-3">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <Coins size={14} className="text-amber-500" />
            <span>{critter.price.toLocaleString()} 벨</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-700">{critter.time}</span>
            {activeNow ? (
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1 rounded">
                지금 출현!
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-400 text-[9px] font-medium px-1 rounded">
                부재중
              </span>
            )}
          </div>

          {critter.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span>
                장소: <strong className="text-slate-700">{critter.location}</strong>
              </span>
            </div>
          )}

          {critter.size && (
            <div className="flex items-center gap-1.5">
              <HelpCircle size={14} className="text-slate-400 flex-shrink-0" />
              <span>
                그림자: <strong className="text-slate-700">{sizeLabel}</strong>
              </span>
            </div>
          )}

          {critter.speed && (
            <div className="flex items-center gap-1.5">
              <HelpCircle size={14} className="text-slate-400 flex-shrink-0" />
              <span>
                특징: <strong className="text-slate-700">{critter.speed}</strong>
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mt-1">
            <Calendar size={14} className="text-emerald-500 flex-shrink-0" />
            <span>
              출현시기:{' '}
              {critter.months.length === 12
                ? '연중무휴'
                : `${critter.months.join(', ')}월`}
            </span>
          </div>
        </div>
      </div>

      {critter.desc && (
        <div className="bg-emerald-50/70 border-t border-emerald-100/50 px-4 py-2 text-[10px] text-emerald-800 flex items-center gap-1">
          <span>💡 {critter.desc}</span>
        </div>
      )}
    </div>
  );
}
