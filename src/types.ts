export type DutyType = "morning" | "evening" | "night" | "holiday" | "custom" | "none";

export interface DutyConfig {
  id: string;
  type: DutyType;
  label: string;
  colorName: string; // "blue", "pink", "yellow", "slate", etc.
  bgColor: string;   // Tailwind class e.g., "bg-blue-500"
  textColor: string; // Tailwind class e.g., "text-blue-900"
  borderColor: string; // Tailwind class e.g., "border-blue-300"
  badgeColor: string; // Tailwind class for status indicators
  startTime?: string; // e.g., "08:00 AM"
  endTime?: string;   // e.g., "04:00 PM"
}

export interface UserDuty {
  date: string; // YYYY-MM-DD format
  dutyId: string; // Configured ID
  notes?: string;
  startTime?: string;
  endTime?: string;
  hasStickyNote?: boolean;
  stickyNoteText?: string;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD format
  name: string;
  type: "holiday" | "event";
  description: string;
}

export interface CountryConfig {
  code: string;
  name: string;
}
