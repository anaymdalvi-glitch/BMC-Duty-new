import React from "react";
import { DutyConfig, UserDuty } from "../types";
import { BarChart3, Clock, CalendarDays, Percent, Smile, Coffee } from "lucide-react";
import { getDutyColorStyles } from "../utils";

interface StatsPanelProps {
  year: number;
  monthIndex: number;
  userDuties: Record<string, UserDuty>;
  configs: DutyConfig[];
}

export default function StatsPanel({
  year,
  monthIndex,
  userDuties,
  configs
}: StatsPanelProps) {
  const formattedMonthStr = String(monthIndex + 1).padStart(2, "0");
  const monthPrefix = `${year}-${formattedMonthStr}-`;

  // Get all duties assigned for the active month
  const activeMonthDuties = Object.entries(userDuties)
    .filter(([date]) => date.startsWith(monthPrefix))
    .map(([, duty]) => duty);

  // Initialize aggregation counters
  let morningCount = 0;
  let eveningCount = 0;
  let nightCount = 0;
  let holidayCount = 0;
  let customCount = 0;

  activeMonthDuties.forEach((duty) => {
    const config = configs.find((c) => c.id === duty.dutyId);
    if (!config) return;

    if (config.type === "morning") morningCount++;
    else if (config.type === "evening") eveningCount++;
    else if (config.type === "night") nightCount++;
    else if (config.type === "holiday") holidayCount++;
    else if (config.type === "custom") customCount++;
  });

  const totalShifts = morningCount + eveningCount + nightCount + customCount;
  const totalWorkingHours = totalShifts * 8; // Standard 8 hours per duty shift
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const unassignedDays = totalDaysInMonth - activeMonthDuties.length;
  const totalRestDays = holidayCount + unassignedDays;

  // Percentage distribution
  const workRatio = totalDaysInMonth > 0 ? Math.round((totalShifts / totalDaysInMonth) * 100) : 0;
  const restRatio = 100 - workRatio;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          Month Summary
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Metrics for the selected month based on your logged duties.
        </p>
      </div>

      {/* Hero Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div id="stat-working-hours" className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs font-bold text-slate-400 uppercase tracking-wide">Work Hours</p>
            <p className="text-xl font-extrabold text-slate-800">{totalWorkingHours} hrs</p>
          </div>
        </div>

        <div id="stat-total-shifts" className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 text-pink-600 rounded-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xs font-bold text-slate-400 uppercase tracking-wide">Total Shifts</p>
            <p className="text-xl font-extrabold text-slate-800">{totalShifts} days</p>
          </div>
        </div>
      </div>

      {/* Progress visual bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-2xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-blue-500" />
            Duty Ratio ({workRatio}%)
          </span>
          <span className="flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-slate-400" />
            Rest Ratio ({restRatio}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
            style={{ width: `${workRatio}%` }}
          />
          <div
            className="h-full bg-slate-300 transition-all duration-500"
            style={{ width: `${restRatio}%` }}
          />
        </div>
      </div>

      {/* Duty breakdown counts */}
      <div className="space-y-3 pt-2">
        <h4 className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Shift Breakdown</h4>

        <div className="space-y-2">
          {configs.map((config) => {
            const isHoliday = config.type === "holiday";
            const isBlank = config.colorName === "blank";

            // Calculate the actual count of assignments for this configuration this month
            let count = 0;
            if (isHoliday) {
              count = totalRestDays;
            } else {
              count = activeMonthDuties.filter((d) => d.dutyId === config.id).length;
            }

            // Only show custom duties if they have at least 1 shift assigned this month (matching original pattern)
            if (config.type === "custom" && count === 0) {
              return null;
            }

            // Retrieve the active dynamic color mapping matching user's custom choice
            const styles = getDutyColorStyles(config.colorName);
            const dotClass = isBlank || isHoliday
              ? "border border-dashed border-slate-400 bg-white"
              : styles.badgeColor;

            return (
              <div
                key={config.id}
                id={`breakdown-${config.id}`}
                className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
                  <span className="text-slate-600 font-medium">
                    {config.label}
                    {isHoliday && " & Off Days"}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
