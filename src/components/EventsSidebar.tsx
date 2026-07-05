import React from "react";
import { CalendarEvent, DutyConfig, UserDuty } from "../types";
import {
  Sparkles,
  Calendar,
  MapPin,
  Loader2,
  Info,
  CheckCircle,
  RefreshCw,
  Bell,
  Megaphone,
  CheckSquare,
  FileText
} from "lucide-react";
import { LanguageConfig } from "../App";
import { LanguageCode, translate } from "../utils";

interface EventsSidebarProps {
  events: CalendarEvent[];
  isLoading: boolean;
  source: string;
  calendarLanguage: LanguageCode;
  languages: LanguageConfig[];
  onLanguageChange: (lang: LanguageCode) => void;
  onAddHolidayToDuties: (dateStr: string, name: string) => void;
  onFetchEvents: () => void;
  // Optional enhanced props to sync active user roster & sticky notes
  userDuties?: Record<string, UserDuty>;
  configs?: DutyConfig[];
  year?: number;
  monthIndex?: number;
}

export default function EventsSidebar({
  events,
  isLoading,
  source,
  calendarLanguage,
  languages,
  onLanguageChange,
  onAddHolidayToDuties,
  onFetchEvents,
  userDuties = {},
  configs = [],
  year = 2026,
  monthIndex = 6
}: EventsSidebarProps) {
  // Translate helper for the sidebar titles
  const t = (key: string) => translate(key, calendarLanguage);

  // Parse active month stats
  const activeMonthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthDuties = Object.values(userDuties).filter(
    (d) => d.date && d.date.startsWith(activeMonthPrefix)
  );

  const totalAssignedDays = monthDuties.filter(
    (d) => d.dutyId && d.dutyId !== "duty_holiday"
  ).length;

  const totalLeavesDays = monthDuties.filter(
    (d) => d.dutyId === "duty_holiday"
  ).length;

  // Extract dates with active pinned sticky notes
  const activeStickyNotes = Object.values(userDuties).filter(
    (d) => d.date && d.date.startsWith(activeMonthPrefix) && d.hasStickyNote && d.stickyNoteText?.trim()
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full space-y-5">
      
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            {t("Notifications & Leaves")}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t("Keep track of leaves, shifts, holidays and announcements.")}
          </p>
        </div>

        <button
          id="btn-refresh-events"
          onClick={onFetchEvents}
          disabled={isLoading}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh updates"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
        </button>
      </div>

      {/* LANGUAGE SELECTOR */}
      <div className="space-y-1.5">
        <label className="block text-4xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-500" />
          {t("Calendar Language")}
        </label>
        <select
          id="select-language"
          value={calendarLanguage}
          onChange={(e) => {
            onLanguageChange(e.target.value as LanguageCode);
          }}
          className="w-full text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all cursor-pointer min-h-[36px]"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-thin max-h-[480px]">
        
        {/* SECTION 1: IMPORTANT NOTIFICATIONS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            {t("Important Notifications")}
          </h4>
          
          <div className="space-y-2.5">
            {/* Announcement 1: Roster finalization */}
            <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-start gap-2.5">
              <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-4xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                  {t("System Announcement")}
                </span>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {t("July Roster Finalized")}
                </p>
                <p className="text-5xs sm:text-3xs text-slate-500 mt-1 leading-normal">
                  {t("BMC duty roster has been updated. Please submit next month's leave applications prior to the 25th of the month.")}
                </p>
              </div>
            </div>

            {/* Announcement 2: Live month roster stats */}
            <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-4xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">
                  {t("My Active Statistics")}
                </span>
                <div className="text-xs font-bold text-slate-800 leading-snug">
                  {totalAssignedDays > 0 ? (
                    <span>
                      {t("You have")} <strong className="text-blue-700">{totalAssignedDays}</strong> {t("active duty days assigned.")}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">
                      {t("No active duties assigned yet. Click shifts to color-code your roster.")}
                    </span>
                  )}
                </div>
                {totalLeavesDays > 0 && (
                  <p className="text-5xs sm:text-3xs text-slate-500 mt-1 leading-normal">
                    🏏 {t("Includes")} <strong className="text-rose-600">{totalLeavesDays}</strong> {t("marked leave/holiday days.")}
                  </p>
                )}
              </div>
            </div>

            {/* Active Pinned Sticky Notes */}
            {activeStickyNotes.length > 0 && (
              <div className="space-y-2">
                <span className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">
                  📌 {t("Pinned Reminders")} ({activeStickyNotes.length})
                </span>
                {activeStickyNotes.map((note, index) => (
                  <div key={index} className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-5xs font-bold text-slate-500">
                        {new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <p className="text-3xs text-slate-700 font-medium truncate">
                        {note.stickyNoteText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: UPCOMING LEAVES & HOLIDAYS */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            {t("Upcoming Leaves & Holidays")}
          </h4>

          {/* List Content */}
          <div className="space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="text-5xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  {t("Grounding real-time calendars...")}
                </p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-100 rounded-xl p-4">
                <Calendar className="w-6 h-6 text-slate-300 mb-1.5" />
                <p className="text-3xs font-bold text-slate-500">{t("No public holidays found.")}</p>
              </div>
            ) : (
              events.map((event, idx) => {
                const isHoliday = event.type === "holiday";
                const dateObj = new Date(event.date);
                const weekdayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
                const dayNum = dateObj.getDate();

                let formattedDate = `${weekdayName}, ${monthName} ${dayNum}`;
                if (calendarLanguage === "mr" || calendarLanguage === "hi") {
                  const localizedWeekday = translate(dateObj.toLocaleDateString("en-US", { weekday: "long" }), calendarLanguage);
                  const localizedMonth = translate(dateObj.toLocaleDateString("en-US", { month: "long" }), calendarLanguage);
                  formattedDate = `${localizedWeekday}, ${dayNum} ${localizedMonth}`;
                }

                return (
                  <div
                    key={`${event.date}-${idx}`}
                    id={`event-item-${event.date}-${idx}`}
                    className={`group relative p-3 rounded-xl border transition-all ${
                      isHoliday
                        ? "bg-rose-50/20 border-rose-100 hover:border-rose-200"
                        : "bg-indigo-50/20 border-indigo-100 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-1">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            isHoliday
                              ? "bg-rose-100 text-rose-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {isHoliday ? t("Public Holiday") : t("Live Event")}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 pt-0.5 leading-snug">
                          {translate(event.name, calendarLanguage)}
                        </h4>
                      </div>

                      <span className="text-[10px] font-extrabold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md shrink-0">
                        {formattedDate}
                      </span>
                    </div>

                    <p className="text-5xs sm:text-3xs text-slate-500 mt-1 leading-relaxed">
                      {translate(event.description, calendarLanguage)}
                    </p>

                    {isHoliday && (
                      <button
                        id={`btn-add-holiday-${event.date}`}
                        onClick={() => onAddHolidayToDuties(event.date, event.name)}
                        className="mt-2 w-full flex items-center justify-center gap-1 text-[9px] font-black text-rose-600 bg-white/60 hover:bg-rose-500 hover:text-white border border-rose-200/60 rounded-lg py-1 transition-all shadow-3xs"
                        title="Assign off day/holiday to your shift roster"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {t("Mark Day Off / Off Duty")}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[10px] text-slate-500 leading-normal">
          {source === "gemini-live" ? (
            <p>
              Verified via <strong>Gemini Search Grounding</strong>.
            </p>
          ) : (
            <p>Currently displaying offline fallback calendar data.</p>
          )}
          <p className="mt-1 font-bold text-slate-600 uppercase text-[9px]">
            {t("Double Click day cells to toggle & pin sticky notes")}
          </p>
        </div>
      </div>
    </div>
  );
}
