import React, { useState, useEffect } from "react";
import { DutyConfig, UserDuty, CalendarEvent, CountryConfig, DutyType } from "./types";
import CalendarGrid from "./components/CalendarGrid";
import DutySelector from "./components/DutySelector";
import EventsSidebar from "./components/EventsSidebar";
import StatsPanel from "./components/StatsPanel";
import TimePickerAMPM from "./components/TimePickerAMPM";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  X,
  Plus
} from "lucide-react";

// Custom circular emblem representing the Brihanmumbai Municipal Corporation (BMC) coat of arms
const BMCLogo = () => (
  <svg
    id="bmc-mumbai-emblem"
    viewBox="0 0 100 100"
    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 drop-shadow-md select-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer golden rim & rich navy blue base */}
    <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#d97706" strokeWidth="3" />
    <circle cx="50" cy="50" r="43" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1.5" />
    
    {/* Decorative inner dotted border */}
    <circle cx="50" cy="50" r="39" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
    
    {/* Royal Shield / Crest in Center */}
    <path
      d="M50 20 L72 32 L72 58 C72 72 50 82 50 82 C50 82 28 72 28 58 L28 32 Z"
      fill="#1d4ed8"
      stroke="#fbbf24"
      strokeWidth="2.5"
    />
    
    {/* Sarnath Lion Capital (representing State emblem of India on BMC crest) */}
    <path d="M46 27 L54 27 L53 38 L47 38 Z" fill="#fbbf24" />
    <circle cx="50" cy="25" r="2.5" fill="#fbbf24" />
    
    {/* Gateway of India silhouette (iconic Mumbai monument on BMC crest) */}
    <path
      d="M36 62 L36 49 C36 49 39 48 50 48 C61 48 64 49 64 49 L64 62"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Archway inner details */}
    <path
      d="M43 62 L43 54 C43 52 45 52 50 52 C55 52 57 52 57 54 L57 62"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="1.5"
    />
    
    {/* Left and right traditional wheat stalks / garlands */}
    <path d="M22 45 C 20 60, 32 75, 45 78" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M78 45 C 80 60, 68 75, 55 78" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Red Ribbon / Scroll with Motto representation */}
    <path d="M22 72 C 35 77, 65 77, 78 72 L 75 78 C 65 83, 35 83, 25 78 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
    
    {/* Motto representation (Three elegant center points representing Sanskrit text "Yato Dharmastato Jayah") */}
    <circle cx="43" cy="76" r="1.2" fill="#ffffff" />
    <circle cx="50" cy="76" r="1.2" fill="#ffffff" />
    <circle cx="57" cy="76" r="1.2" fill="#ffffff" />
  </svg>
);

// Initial duty configurations reflecting the user's explicit choices:
// - Morning in Blue
// - Evening in pink
// - Night in yellow
// - Holidays in blank color (blank representation)
const INITIAL_DUTY_CONFIGS: DutyConfig[] = [
  {
    id: "duty_morning",
    type: "morning",
    label: "Morning Duty",
    colorName: "blue",
    bgColor: "bg-blue-500/15 hover:bg-blue-500/25",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-500",
    startTime: "08:00 AM",
    endTime: "04:00 PM"
  },
  {
    id: "duty_evening",
    type: "evening",
    label: "Evening Duty",
    colorName: "pink",
    bgColor: "bg-pink-500/15 hover:bg-pink-500/25",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    badgeColor: "bg-pink-500",
    startTime: "04:00 PM",
    endTime: "12:00 AM"
  },
  {
    id: "duty_night",
    type: "night",
    label: "Night Duty",
    colorName: "yellow",
    bgColor: "bg-amber-400/15 hover:bg-amber-400/25",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-400",
    startTime: "12:00 AM",
    endTime: "08:00 AM"
  },
  {
    id: "duty_holiday",
    type: "holiday",
    label: "Holiday",
    colorName: "blank",
    bgColor: "bg-transparent",
    textColor: "text-slate-500",
    borderColor: "border-dashed border-slate-300",
    badgeColor: "bg-slate-400",
    startTime: "",
    endTime: ""
  }
];

import { LanguageCode, translate, MONTHS_LOCALIZED, WEEKDAYS_LOCALIZED } from "./utils";

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
}

const LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "hi", name: "हिंदी (Hindi)" }
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(today.getMonth());
  const [calendarLanguage, setCalendarLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("custom_duty_calendar_language");
    return (saved as LanguageCode) || "en";
  });

  // States for calendar data
  const [userDuties, setUserDuties] = useState<Record<string, UserDuty>>(() => {
    const saved = localStorage.getItem("custom_duty_calendar_user_duties");
    return saved ? JSON.parse(saved) : {};
  });

  const [configs, setConfigs] = useState<DutyConfig[]>(() => {
    const saved = localStorage.getItem("custom_duty_calendar_configs");
    return saved ? JSON.parse(saved) : INITIAL_DUTY_CONFIGS;
  });

  const [selectedDutyId, setSelectedDutyId] = useState<string>(INITIAL_DUTY_CONFIGS[0].id);
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [eventSource, setEventSource] = useState<string>("offline-fallback");

  // Notes Modal state
  const [activeNoteDate, setActiveNoteDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [hasStickyNote, setHasStickyNote] = useState<boolean>(false);

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem("custom_duty_calendar_user_duties", JSON.stringify(userDuties));
  }, [userDuties]);

  useEffect(() => {
    localStorage.setItem("custom_duty_calendar_configs", JSON.stringify(configs));
  }, [configs]);

  useEffect(() => {
    localStorage.setItem("custom_duty_calendar_language", calendarLanguage);
  }, [calendarLanguage]);

  // Fetch actual live events and upcoming holidays from node server (powered by Gemini)
  const fetchCalendarEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          month: MONTHS[currentMonthIndex],
          country: "India",
          countryCode: "IN",
          language: calendarLanguage
        })
      });
      if (response.ok) {
        const data = await response.json();
        setLiveEvents(data.events || []);
        setEventSource(data.source || "offline-fallback");
      } else {
        console.error("Failed to fetch live events");
      }
    } catch (err) {
      console.error("Error loading live calendar events:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Run on month, year, or language change
  useEffect(() => {
    fetchCalendarEvents();
  }, [currentYear, currentMonthIndex, calendarLanguage]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonthIndex(today.getMonth());
  };

  // Paint / Assign duty on click
  const handleCellClick = (dateStr: string) => {
    // If duty or holiday is already marked, keep normal click behaviour (view details modal) to avoid accidental painting/changes
    if (userDuties[dateStr]) {
      handleCellDoubleClick(dateStr);
      return;
    }

    setUserDuties(prev => {
      const updated = { ...prev };
      const config = configs.find(c => c.id === selectedDutyId);
      updated[dateStr] = {
        date: dateStr,
        dutyId: selectedDutyId,
        notes: "",
        startTime: config?.startTime || "",
        endTime: config?.endTime || ""
      };
      return updated;
    });
  };

  // Open note popup on cell double click or notes pencil click
  const handleCellDoubleClick = (dateStr: string) => {
    const existing = userDuties[dateStr];
    setActiveNoteDate(dateStr);
    setHasStickyNote(existing?.hasStickyNote ?? false);
    setNoteText(existing?.stickyNoteText || "");
  };

  // Save notes form
  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteDate) return;

    setUserDuties(prev => {
      const updated = { ...prev };
      if (!updated[activeNoteDate]) {
        // Create an empty "Holiday/Blank" block if user adds sticky notes to an unassigned day
        updated[activeNoteDate] = {
          date: activeNoteDate,
          dutyId: "duty_holiday",
          hasStickyNote,
          stickyNoteText: hasStickyNote ? noteText : ""
        };
      } else {
        updated[activeNoteDate] = {
          ...updated[activeNoteDate],
          hasStickyNote,
          stickyNoteText: hasStickyNote ? noteText : ""
        };
      }
      return updated;
    });

    setActiveNoteDate(null);
  };

  // Remove shift duty completely
  const handleClearCell = () => {
    if (!activeNoteDate) return;
    setUserDuties(prev => {
      const updated = { ...prev };
      delete updated[activeNoteDate];
      return updated;
    });
    setActiveNoteDate(null);
  };

  // Add Custom Duty Type
  const handleAddConfig = (newConfig: DutyConfig) => {
    setConfigs(prev => [...prev, newConfig]);
  };

  // Update Custom Duty Type styles
  const handleUpdateConfig = (updated: DutyConfig) => {
    setConfigs(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Delete Custom Duty Type
  const handleDeleteConfig = (id: string) => {
    // Reassign user duties using deleted type to default morning or none
    setUserDuties(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        if (updated[date].dutyId === id) {
          delete updated[date];
        }
      });
      return updated;
    });
    setConfigs(prev => prev.filter(c => c.id !== id));
    if (selectedDutyId === id) {
      setSelectedDutyId(configs[0].id);
    }
  };

  // Quickly mark dynamic holiday/off day from sidebar list
  const handleAddHolidayToDuties = (dateStr: string, name: string) => {
    setUserDuties(prev => ({
      ...prev,
      [dateStr]: {
        date: dateStr,
        dutyId: "duty_holiday",
        notes: `Public Holiday: ${name}`,
        startTime: "",
        endTime: ""
      }
    }));
  };

  // Bulk Apply options (e.g. fill weekends with off days)
  const handleBulkFillWeekends = () => {
    const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    setUserDuties(prev => {
      const updated = { ...prev };
      for (let d = 1; d <= totalDays; d++) {
        const date = new Date(currentYear, currentMonthIndex, d);
        const dayOfWeek = date.getDay();
        const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        
        // If Saturday or Sunday and not already set
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          if (!updated[dateStr]) {
            updated[dateStr] = {
              date: dateStr,
              dutyId: "duty_holiday",
              notes: "Weekend",
              startTime: "",
              endTime: ""
            };
          }
        }
      }
      return updated;
    });
  };

  const handleClearMonthDuties = () => {
    const prefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-`;
    setUserDuties(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        if (date.startsWith(prefix)) {
          delete updated[date];
        }
      });
      return updated;
    });
  };

  const renderInfoBanner = () => (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 font-sans">
      <div className="flex items-start gap-2.5 w-full">
        <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0">
          <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="text-[2.8vw] xs:text-3xs sm:text-2xs md:text-xs text-slate-600 leading-relaxed w-full">
          <span className="font-extrabold text-slate-800">{translate("Interactive Roster Canvas:", calendarLanguage)}</span>{" "}
          {translate("Paint shifts by clicking them directly on the grid", calendarLanguage)}{" "}
          <span className="inline-flex flex-wrap gap-1 sm:gap-1.5 items-center my-0.5">
            {configs.map((cfg) => (
              <span key={cfg.id} className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[2vw] xs:text-5xs sm:text-4xs md:text-3xs">
                <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${cfg.badgeColor}`} />
                {translate(cfg.label, calendarLanguage)}
              </span>
            ))}
          </span>{" "}
          {translate("and click any cell in the grid to color-code your roster. Double-click any cell to toggle on-off sticky notes.", calendarLanguage)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-100 py-4 px-4 md:px-8 sticky top-0 z-10 shadow-3xs">
        <div className="max-w-[96%] xl:max-w-[1550px] mx-auto flex items-center justify-center">
          <div className="flex items-center gap-4 justify-center min-w-0">
            <BMCLogo />
            <div className="min-w-0 text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display leading-tight flex items-center gap-2">
                <span>BMC Duty Calendar</span>
              </h1>
              <p className="text-[2.8vw] xs:text-xs sm:text-sm md:text-base text-slate-500 font-extrabold">{translate("Fully customized shift planner with live events", calendarLanguage)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[96%] xl:max-w-[1550px] w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* CALENDAR CONTROLLER BAR */}
        <div className="flex flex-col items-center justify-center text-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-2xs">
          
          {/* Month/Year selector navigation */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full flex-nowrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 sm:p-1.5 shadow-3xs">
              <button
                id="btn-prev-month"
                onClick={handlePrevMonth}
                className="p-1.5 sm:p-2 hover:bg-white hover:shadow-2xs rounded-xl text-slate-700 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="px-3 sm:px-6 text-xs sm:text-base md:text-lg lg:text-xl font-black text-slate-850 min-w-[120px] xs:min-w-[145px] sm:min-w-[200px] text-center uppercase tracking-wider truncate">
                {MONTHS_LOCALIZED[calendarLanguage][currentMonthIndex]} {currentYear}
              </span>
              <button
                id="btn-next-month"
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 hover:bg-white hover:shadow-2xs rounded-xl text-slate-700 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <button
              id="btn-today"
              onClick={handleResetToToday}
              className="text-[10px] xs:text-xs sm:text-sm md:text-base font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 xs:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-3xs whitespace-nowrap shrink-0"
            >
              {translate("Today", calendarLanguage)}
            </button>
          </div>

          {/* Quick instructions indicator */}
          <div className="flex items-center gap-1.5 text-[2.2vw] xs:text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-sans whitespace-nowrap">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 shrink-0 animate-pulse" />
            {translate("Double Click day cells to toggle & pin sticky notes", calendarLanguage)}
          </div>

        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: DUTY PALETTE & STATS */}
          <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
            
            {/* Custom Duty Config & Palette Selector - DESKTOP ONLY */}
            <div className="hidden lg:block">
              <DutySelector
                configs={configs}
                selectedDutyId={selectedDutyId}
                onSelectDuty={setSelectedDutyId}
                onUpdateConfig={handleUpdateConfig}
                onAddConfig={handleAddConfig}
                onDeleteConfig={handleDeleteConfig}
              />
            </div>

            {/* Interactive Canvas Guide Banner - DESKTOP ONLY */}
            <div className="hidden lg:block">
              {renderInfoBanner()}
            </div>

            {/* Shift Tracker Metrics Statistics Panel */}
            <StatsPanel
              year={currentYear}
              monthIndex={currentMonthIndex}
              userDuties={userDuties}
              configs={configs}
            />

          </div>

          {/* CENTER PANEL: INTERACTIVE CALENDAR CONTAINER */}
          <div className="order-1 lg:order-2 lg:col-span-6 space-y-4">
            
            <CalendarGrid
              year={currentYear}
              monthIndex={currentMonthIndex}
              userDuties={userDuties}
              events={liveEvents}
              configs={configs}
              selectedDutyId={selectedDutyId}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              calendarLanguage={calendarLanguage}
            />

            {/* Custom Duty Config & Palette Selector - MOBILE ONLY (shown below calendar) */}
            <div className="block lg:hidden">
              <DutySelector
                configs={configs}
                selectedDutyId={selectedDutyId}
                onSelectDuty={setSelectedDutyId}
                onUpdateConfig={handleUpdateConfig}
                onAddConfig={handleAddConfig}
                onDeleteConfig={handleDeleteConfig}
              />
            </div>

            {/* Interactive Canvas Guide Banner - MOBILE ONLY */}
            <div className="block lg:hidden">
              {renderInfoBanner()}
            </div>
          </div>

          {/* RIGHT SIDEBAR: LIVE EVENTS & HOLIDAYS */}
          <div className="order-3 lg:order-3 lg:col-span-3">
            <EventsSidebar
              events={liveEvents}
              isLoading={isLoadingEvents}
              source={eventSource}
              calendarLanguage={calendarLanguage}
              languages={LANGUAGES}
              onLanguageChange={setCalendarLanguage}
              onAddHolidayToDuties={handleAddHolidayToDuties}
              onFetchEvents={fetchCalendarEvents}
              userDuties={userDuties}
              configs={configs}
              year={currentYear}
              monthIndex={currentMonthIndex}
            />
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 px-12 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Custom Duty Calendar. Local data stored securely in your web browser.</p>
          <p className="flex items-center gap-1.5 font-medium text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Dynamic scheduling powered by AI Studio and Gemini
          </p>
        </div>
      </footer>

      {/* NOTES & DETAILS MODAL */}
      {activeNoteDate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{translate("Sticky Note & Date Details", calendarLanguage)}</h3>
                <p className="text-2xs font-semibold text-slate-400 uppercase mt-0.5 tracking-wider">
                  Date: {new Date(activeNoteDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setActiveNoteDate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="form-shift-details" onSubmit={handleSaveNotes} className="p-6 space-y-4">
              
              {/* Current assigned duty indicator - Read Only */}
              <div>
                <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  {translate("Assigned Duty Color-Code", calendarLanguage)}
                </span>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span
                    className={`w-4 h-4 rounded-full ${
                      userDuties[activeNoteDate] && configs.find(c => c.id === userDuties[activeNoteDate].dutyId)?.colorName === "blank"
                        ? "border border-dashed border-slate-400 bg-white"
                        : configs.find(c => c.id === (userDuties[activeNoteDate]?.dutyId || "duty_holiday"))?.badgeColor || "bg-slate-400"
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      {translate(configs.find(c => c.id === (userDuties[activeNoteDate]?.dutyId || "duty_holiday"))?.label || "No Shift", calendarLanguage)}
                    </span>
                    <span className="block text-4xs text-slate-400 font-bold uppercase tracking-wide">
                      {translate("Paint shifts by clicking them directly on the grid", calendarLanguage)}
                    </span>
                  </div>
                </div>
              </div>

              {/* On-Off Based Sticky Note Toggle Option */}
              <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📌</span>
                  <div>
                    <label htmlFor="toggle-sticky" className="text-xs font-extrabold text-amber-900 block cursor-pointer">
                      {translate("Enable Sticky Note", calendarLanguage)}
                    </label>
                    <span className="text-4xs text-amber-700 font-medium block">
                      {translate("Toggle to display a post-it note on this day", calendarLanguage)}
                    </span>
                  </div>
                </div>
                <button
                  id="toggle-sticky"
                  type="button"
                  onClick={() => setHasStickyNote(!hasStickyNote)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasStickyNote ? "bg-amber-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      hasStickyNote ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Conditional Sticky Note Text Input */}
              {hasStickyNote ? (
                <div className="bg-amber-100/40 rounded-xl p-4 border border-amber-200 shadow-2xs relative">
                  <div className="absolute top-2 right-3 opacity-30 select-none text-xs">📌</div>
                  <label htmlFor="textarea-sticky-note" className="block text-2xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                    Sticky Note Content
                  </label>
                  <textarea
                    id="textarea-sticky-note"
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type your quick note or reminder here..."
                    className="w-full text-xs sm:text-sm bg-amber-50/40 border border-amber-200/60 rounded-lg p-2.5 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-400 resize-none font-sans font-medium"
                    required
                  />
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Sticky note is currently off</p>
                  <p className="text-4xs text-slate-400 font-bold uppercase mt-0.5 tracking-wide">Toggle on to pin a reminder</p>
                </div>
              )}

              {/* Modal actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  id="btn-delete-duty-cell"
                  type="button"
                  onClick={handleClearCell}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 px-4 py-2 rounded-xl border border-rose-100/50 transition-colors"
                >
                  Clear Shift
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-cancel-modal"
                    type="button"
                    onClick={() => setActiveNoteDate(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2"
                  >
                    {translate("Cancel", calendarLanguage)}
                  </button>
                  <button
                    id="btn-save-modal"
                    type="submit"
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4.5 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {translate("Save Notes", calendarLanguage)}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
