import React from "react";
import { DutyConfig, UserDuty, CalendarEvent } from "../types";
import { Calendar as CalendarIcon, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { getDutyColorStyles, LanguageCode, WEEKDAYS_LOCALIZED, translate, getDutyShortForm } from "../utils";

interface CalendarGridProps {
  year: number;
  monthIndex: number;
  userDuties: Record<string, UserDuty>;
  events: CalendarEvent[];
  configs: DutyConfig[];
  selectedDutyId: string;
  onCellClick: (dateStr: string) => void;
  onCellDoubleClick: (dateStr: string) => void;
  calendarLanguage: LanguageCode;
}

export default function CalendarGrid({
  year,
  monthIndex,
  userDuties,
  events,
  configs,
  selectedDutyId,
  onCellClick,
  onCellDoubleClick,
  calendarLanguage
}: CalendarGridProps) {
  // Helper to check if a day is today
  const isTodayDate = (d: number, m: number, y: number) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;
  };

  // Calculate grid params
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();

  // Create grid cells
  const cells: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const prevMonthIdx = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNum: prevDay,
      isCurrentMonth: false,
      isToday: isTodayDate(prevDay, prevMonthIdx, prevYear)
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: isTodayDate(d, monthIndex, year)
    });
  }

  // Next month padding to fill full weeks (6 rows total)
  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: false,
      isToday: isTodayDate(d, nextMonthIdx, nextYear)
    });
  }

  const weekdays = WEEKDAYS_LOCALIZED[calendarLanguage] || WEEKDAYS_LOCALIZED.en;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[600px] lg:min-h-[750px]">
      {/* Weekdays header */}
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100 py-4 text-center">
        {weekdays.map((day) => (
          <div key={day} className="text-[3vw] xs:text-xs sm:text-sm md:text-base font-black text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100 border-b border-slate-100">
        {cells.map((cell, idx) => {
          const duty = userDuties[cell.dateStr];
          const config = duty ? configs.find((c) => c.id === duty.dutyId) : null;
          
          // Fetch events on this day (only for the active current month to prevent confusing padding cell indicators)
          const dayEvents = cell.isCurrentMonth ? events.filter((e) => e.date === cell.dateStr) : [];
          const hasHoliday = dayEvents.some((e) => e.type === "holiday");
          const hasEvent = dayEvents.some((e) => e.type === "event");

          // Determine cell styling
          let cellStyle = "bg-white text-slate-700";
          let borderOverlay = "border-transparent";

          if (!cell.isCurrentMonth) {
            cellStyle = "bg-slate-50/40 text-slate-400";
          }

          if (cell.isToday) {
            borderOverlay = "ring-2 ring-blue-500 ring-inset";
          }

          // Active duty styles
          let dutyBg = "";
          let dutyText = "";
          let dutyBorder = "";

          if (config) {
            const styles = getDutyColorStyles(config.colorName);
            dutyBg = styles.bgColor;
            dutyText = styles.textColor;
            dutyBorder = styles.borderColor.startsWith("border") ? styles.borderColor : `border ${styles.borderColor}`;
          }

          return (
            <div
              key={`${cell.dateStr}-${idx}`}
              id={`calendar-cell-${cell.dateStr}`}
              className={`relative group min-h-[110px] xs:min-h-[125px] sm:min-h-[145px] md:min-h-[160px] lg:min-h-[175px] p-2 flex flex-col justify-between transition-all cursor-pointer hover:bg-slate-50/60 select-none ${cellStyle} ${borderOverlay}`}
              onClick={() => onCellClick(cell.dateStr)}
              onDoubleClick={() => onCellDoubleClick(cell.dateStr)}
            >
              {/* Day header: number + event dots */}
              <div className="flex items-center justify-between p-0.5 mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[3.5vw] xs:text-sm sm:text-base md:text-lg font-extrabold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? "bg-blue-600 text-white shadow-sm font-black"
                        : cell.isCurrentMonth
                        ? "text-slate-800 font-extrabold"
                        : "text-slate-400"
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                  {cell.isToday && (
                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5" title={translate("Today (Live)", calendarLanguage)}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {/* Holiday / Event dot markers */}
                <div className="flex gap-1 sm:gap-1.5">
                  {hasHoliday && (
                    <span
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-rose-500"
                      title={translate("Public Holiday", calendarLanguage)}
                    />
                  )}
                  {hasEvent && (
                    <span
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-indigo-500"
                      title={translate("Live Event", calendarLanguage)}
                    />
                  )}
                </div>
              </div>

              {/* Duty banner area */}
              <div className="flex-1 flex flex-col justify-end p-0.5 my-1">
                {config ? (
                  <div
                    className={`rounded-xl p-1.5 py-2 sm:py-3 text-center shadow-sm overflow-hidden ${dutyBg} ${dutyText} ${dutyBorder} transition-all group-hover:scale-[1.04]`}
                    title={`${translate(config.label, calendarLanguage)} (${
                      duty?.startTime && duty?.endTime
                        ? `${duty.startTime} - ${duty.endTime}`
                        : config.startTime && config.endTime
                        ? `${config.startTime} - ${config.endTime}`
                        : config.type === "holiday"
                        ? translate("Holiday", calendarLanguage)
                        : ""
                    })`}
                  >
                    <p className="text-[4.5vw] xs:text-xs sm:text-sm md:text-base font-black uppercase tracking-wider leading-none">
                      {getDutyShortForm(config.label, config.type, calendarLanguage)}
                    </p>
                  </div>
                ) : (
                  <div className="h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[2vw] xs:text-4xs sm:text-3xs md:text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                      + {translate("Add Shift", calendarLanguage)}
                    </span>
                  </div>
                )}

                {/* Sticky Note element: yellow post-it styled sticker, visible if enabled */}
                {duty?.hasStickyNote && duty?.stickyNoteText && (
                  <div className="bg-amber-100/95 border-l-2 border-amber-500 text-amber-950 text-[1.8vw] xs:text-4xs sm:text-3xs md:text-2xs p-1.5 rounded-lg mt-1 shadow-3xs font-sans font-bold line-clamp-2 leading-tight">
                    📌 {duty.stickyNoteText}
                  </div>
                )}
              </div>

              {/* Day footer: custom notes indicator or event label */}
              <div className="flex items-center justify-between px-1 py-0.5 mt-1">
                <div className="flex items-center gap-1 min-w-0">
                  {duty?.hasStickyNote && (
                    <span className="text-[1.8vw] xs:text-4xs sm:text-3xs md:text-2xs font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide shrink-0">
                      📌
                    </span>
                  )}
                  {dayEvents.length > 0 && (
                    <span className="text-[1.8vw] xs:text-4xs sm:text-3xs md:text-2xs font-extrabold text-slate-400 truncate max-w-[50px] sm:max-w-[90px]">
                      {translate(dayEvents[0].name, calendarLanguage)}
                    </span>
                  )}
                </div>

                {/* Hover sticky-note helper */}
                <span className="text-[1.8vw] xs:text-4xs sm:text-3xs md:text-2xs font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  📌
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
