"use client";

import { Week } from "@/types/menu";
import { LockKey as Lock } from "@phosphor-icons/react/ssr";
import { LocaleKey, LOCALES } from "@/data/locales";
import { Button } from "@vayva/ui";

interface WeekSelectorProps {
  weeks: Week[];
  selectedWeekId: string;
  onSelectWeek: (id: string) => void;
  lang: LocaleKey;
}

export function WeekSelector({
  weeks,
  selectedWeekId,
  onSelectWeek,
  lang,
}: WeekSelectorProps) {
  const t = LOCALES[lang];

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar">
          {weeks.map((week: any) => {
            const isSelected = week.id === selectedWeekId;
            const isLocked = week.isLocked;

            return (
              <Button
                key={week.id}
                variant="ghost"
                onClick={() => onSelectWeek(week.id)}
                className={`
                                    flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-xl transition-all border-2 h-auto
                                    ${
                                      isSelected
                                        ? "border-[#22C55E] bg-[#22C55E]/5 text-[#22C55E] hover:bg-[#22C55E]/10"
                                        : "border-transparent hover:bg-gray-50 text-gray-500"
                                    }
                                `}
                aria-label={`Select week ${week.label[lang]}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider mb-1">
                  {t.week}
                </span>
                <span
                  className={`text-sm font-bold whitespace-nowrap ${isSelected ? "text-[#22C55E]" : "text-gray-900"}`}
                >
                  {week.label[lang]}
                </span>
                {isLocked && <Lock className="w-3 h-3 mt-1 text-gray-400" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Cutoff / Locked Message Bar */}
      <div className="bg-gray-50 border-b border-gray-100 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center text-xs text-gray-500">
          {(() => {
            const activeWeek = weeks.find((w) => w.id === selectedWeekId);
            if (!activeWeek) return null;

            if (activeWeek.isLocked) {
              return (
                <span className="flex items-center gap-1 font-medium text-amber-600">
                  <Lock className="w-3 h-3" /> {t.lockedWeek}
                </span>
              );
            }
            return (
              <span>
                {t.cutoffMessage}{" "}
                {new Date(activeWeek.cutoffDate || new Date()).toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-US",
                  { month: "short", day: "numeric", weekday: "short" },
                )}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
