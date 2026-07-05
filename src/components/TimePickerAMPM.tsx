import React from "react";
import { parseTimeToObj, formatTimeObj, TimeObj } from "../utils";

interface TimePickerAMPMProps {
  idPrefix: string;
  label: string;
  value: string; // e.g. "08:00 AM" or "04:30 PM"
  onChange: (newValue: string) => void;
}

export default function TimePickerAMPM({
  idPrefix,
  label,
  value,
  onChange
}: TimePickerAMPMProps) {
  const timeObj = parseTimeToObj(value);

  const updatePart = (updates: Partial<TimeObj>) => {
    const next = { ...timeObj, ...updates };
    onChange(formatTimeObj(next));
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className="space-y-1">
      <span className="block text-2xs font-extrabold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
        {/* Time Inputs Row */}
        <div className="flex items-center justify-center gap-1.5 bg-white border border-slate-200/60 rounded-lg p-1">
          {/* Hour Select */}
          <select
            id={`${idPrefix}-select-hour`}
            value={timeObj.hour}
            onChange={(e) => updatePart({ hour: e.target.value })}
            className="bg-transparent border-none text-sm font-bold text-slate-700 py-1 px-1.5 focus:outline-none cursor-pointer min-h-[36px] sm:min-h-0 flex-1 text-center"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <span className="text-xs font-extrabold text-slate-400">:</span>

          {/* Minute Select */}
          <select
            id={`${idPrefix}-select-minute`}
            value={timeObj.minute}
            onChange={(e) => updatePart({ minute: e.target.value })}
            className="bg-transparent border-none text-sm font-bold text-slate-700 py-1 px-1.5 focus:outline-none cursor-pointer min-h-[36px] sm:min-h-0 flex-1 text-center"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            {!minutes.includes(timeObj.minute) && (
              <option value={timeObj.minute}>{timeObj.minute}</option>
            )}
          </select>
        </div>

        {/* AM/PM Toggle Row */}
        <div className="flex bg-slate-200/50 p-0.5 rounded-lg w-full">
          <button
            id={`${idPrefix}-btn-am`}
            type="button"
            onClick={() => updatePart({ ampm: "AM" })}
            className={`flex-1 text-xs sm:text-3xs font-black py-1.5 rounded-md transition-all flex items-center justify-center ${
              timeObj.ampm === "AM"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            AM
          </button>
          <button
            id={`${idPrefix}-btn-pm`}
            type="button"
            onClick={() => updatePart({ ampm: "PM" })}
            className={`flex-1 text-xs sm:text-3xs font-black py-1.5 rounded-md transition-all flex items-center justify-center ${
              timeObj.ampm === "PM"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}
