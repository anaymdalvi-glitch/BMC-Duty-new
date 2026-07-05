// Helper functions for AM/PM time picking and formatting

export interface TimeObj {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
}

// Parse a string like "08:00 AM", "16:00", or "8:00 PM" into structured 12-hour components
export function parseTimeToObj(timeStr: string | undefined, defaultVal = "08:00 AM"): TimeObj {
  const str = timeStr || defaultVal;
  const upper = str.trim().toUpperCase();
  const isPM = upper.includes("PM");
  const isAM = upper.includes("AM");

  // Remove non-numeric characters except colon
  const numericPart = upper.replace(/[AP]M/g, "").trim();
  const parts = numericPart.split(":");
  let hr = parseInt(parts[0], 10);
  let min = parts[1] ? parseInt(parts[1], 10) : 0;

  if (isNaN(hr)) hr = 8;
  if (isNaN(min)) min = 0;

  let ampm: "AM" | "PM" = "AM";

  if (isPM || isAM) {
    ampm = isPM ? "PM" : "AM";
    if (hr > 12) hr = hr % 12;
    if (hr === 0) hr = 12;
  } else {
    // Treat as 24-hour if no AM/PM indicator found
    if (hr >= 12) {
      ampm = "PM";
      if (hr > 12) hr = hr - 12;
    } else {
      ampm = "AM";
      if (hr === 0) hr = 12;
    }
  }

  return {
    hour: String(hr).padStart(2, "0"),
    minute: String(min).padStart(2, "0"),
    ampm
  };
}

// Format 12-hour components back into a standard "HH:MM AM/PM" string
export function formatTimeObj(obj: TimeObj): string {
  return `${obj.hour}:${obj.minute} ${obj.ampm}`;
}

// Convert "HH:MM AM/PM" to 24-hour style "HH:MM" (useful for stats or standard formats)
export function to24Hour(timeStr: string | undefined): string {
  if (!timeStr) return "00:00";
  const { hour, minute, ampm } = parseTimeToObj(timeStr);
  let hr = parseInt(hour, 10);
  if (ampm === "PM" && hr < 12) hr += 12;
  if (ampm === "AM" && hr === 12) hr = 0;
  return `${String(hr).padStart(2, "0")}:${minute}`;
}

// Convert 24-hour "HH:MM" string directly to "HH:MM AM/PM"
export function format24HourToAMPM(time24: string): string {
  if (!time24) return "";
  return formatTimeObj(parseTimeToObj(time24));
}

export interface ColorStyles {
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeColor: string;
}

const COLOR_STYLE_MAP: Record<string, ColorStyles> = {
  blue: {
    bgColor: "bg-blue-500/15 hover:bg-blue-500/25",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-500"
  },
  pink: {
    bgColor: "bg-pink-500/15 hover:bg-pink-500/25",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    badgeColor: "bg-pink-500"
  },
  yellow: {
    bgColor: "bg-amber-400/15 hover:bg-amber-400/25",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-400"
  },
  green: {
    bgColor: "bg-emerald-500/15 hover:bg-emerald-500/25",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    badgeColor: "bg-emerald-500"
  },
  purple: {
    bgColor: "bg-purple-500/15 hover:bg-purple-500/25",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-500"
  },
  orange: {
    bgColor: "bg-orange-500/15 hover:bg-orange-500/25",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    badgeColor: "bg-orange-500"
  },
  teal: {
    bgColor: "bg-teal-500/15 hover:bg-teal-500/25",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    badgeColor: "bg-teal-500"
  },
  red: {
    bgColor: "bg-rose-500/15 hover:bg-rose-500/25",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    badgeColor: "bg-rose-500"
  },
  blank: {
    bgColor: "bg-slate-50/50",
    textColor: "text-slate-500",
    borderColor: "border border-dashed border-slate-300",
    badgeColor: "bg-slate-400"
  }
};

export function getDutyColorStyles(colorName: string): ColorStyles {
  const normalized = colorName.toLowerCase();
  return COLOR_STYLE_MAP[normalized] || COLOR_STYLE_MAP.blue;
}

export type LanguageCode = "en" | "mr" | "hi";

export const WEEKDAYS_LOCALIZED: Record<LanguageCode, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  mr: ["रवि", "सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि"],
  hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"]
};

export const MONTHS_LOCALIZED: Record<LanguageCode, string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  mr: [
    "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
    "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
  ],
  hi: [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ]
};

// UI and Common Translation dictionary
export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {},
  mr: {
    "Republic Day": "प्रजासत्ताक दिन",
    "Holi": "होळी",
    "Mahavir Jayanti": "महावीर जयंती",
    "Good Friday": "गुड फ्रायडे",
    "Independence Day": "स्वातंत्र्य दिन",
    "Janmashtami": "श्रीकृष्ण जन्माष्टमी",
    "Gandhi Jayanti": "गांधी जयंती",
    "Dussehra": "दसरा",
    "Diwali": "दिवाळी",
    "Guru Nanak Jayanti": "गुरुनानक जयंती",
    "Christmas Day": "नाताळ",
    "Sunday": "रविवार",
    "Monday": "सोमवार",
    "Tuesday": "मंगळवार",
    "Wednesday": "बुधवार",
    "Thursday": "गुरुवार",
    "Friday": "शुक्रवार",
    "Saturday": "शनिवार",
    "Morning Duty": "सकाळची ड्युटी",
    "Evening Duty": "संध्याकाळची ड्युटी",
    "Night Duty": "रात्रीची ड्युटी",
    "Holiday": "सुट्टी",
    "Live Events & Holidays": "थेट कार्यक्रम आणि सुट्ट्या",
    "Real holidays & cultural events for the selected month.": "निवडलेल्या महिन्यासाठी वास्तविक सुट्ट्या आणि सांस्कृतिक कार्यक्रम.",
    "Calendar Language": "कॅलेंडर भाषा",
    "Public Holiday": "सार्वजनिक सुट्टी",
    "Live Event": "थेट कार्यक्रम",
    "No public holidays found.": "कोणतीही सार्वजनिक सुट्टी आढळली नाही.",
    "Try reloading or switching countries.": "पुन्हा लोड करण्याचा किंवा कॅलेंडर बदलण्याचा प्रयत्न करा.",
    "Mark Day Off / Off Duty": "सुट्टी / ऑफ ड्युटी म्हणून चिन्हांकित करा",
    "Shift Tracker Metrics": "शिफ्ट ट्रॅकर आकडेवारी",
    "Interactive Roster Canvas:": "परस्परसंवादी रोस्टर कॅनव्वास:",
    "and click any cell in the grid to color-code your roster. Double-click any cell to toggle on-off sticky notes.": "आणि आपल्या रोस्टरला रंग-कोड देण्यासाठी ग्रीडमधील कोणत्याही सेलवर क्लिक करा. स्टिकी नोट्स चालू-बंद करण्यासाठी कोणत्याही सेलवर डबल-क्लिक करा.",
    "Double Click day cells to toggle & pin sticky notes": "स्टिकी नोट्स बदलण्यासाठी आणि पिन करण्यासाठी दिवस सेलवर डबल क्लिक करा",
    "Today": "आज",
    "Fully customized shift planner with live events": "थेट कार्यक्रमांसह पूर्णपणे सानुकूलित शिफ्ट प्लॅनर",
    "Duty Palette": "ड्युटी पॅलेट",
    "Add Custom Shift": "सानुकूल शिफ्ट जोडा",
    "Color Theme": "रंग थीम",
    "Start Time": "सुरुवात वेळ",
    "End Time": "शेवटची वेळ",
    "Save Shift": "शिफ्ट जतन करा",
    "Edit Shift": "शिफ्ट संपादित करा",
    "Delete Shift": "शिफ्ट हटवा",
    "Sticky Note & Date Details": "स्टिकी नोट आणि तारीख तपशील",
    "Enable Sticky Note": "स्टिकी नोट सक्षम करा",
    "Toggle to display a post-it note on this day": "या दिवशी पोस्ट-इट नोट प्रदर्शित करण्यासाठी टॉगल करा",
    "Assigned Duty Color-Code": "नियुक्त ड्युटी रंग-कोड",
    "No Shift": "कोणतीही शिफ्ट नाही",
    "Paint shifts by clicking them directly on the grid": "थेट ग्रीडवर क्लिक करून शिफ्ट रंगवा",
    "Save Notes": "नोट्स जतन करा",
    "Calendar": "कॅलेंडर",
    "Shift": "शिफ्ट",
    "Hours": "तास",
    "Add Shift": "शिफ्ट जोडा"
  },
  hi: {
    "Republic Day": "गणतंत्र दिवस",
    "Holi": "होली",
    "Mahavir Jayanti": "महावीर जयंती",
    "Good Friday": "गुड फ्राइडे",
    "Independence Day": "स्वतंत्रता दिवस",
    "Janmashtami": "जन्माष्टमी",
    "Gandhi Jayanti": "गांधी जयंती",
    "Dussehra": "दशहरा",
    "Diwali": "दीवाली",
    "Guru Nanak Jayanti": "गुरु नानक जयंती",
    "Christmas Day": "क्रिसमस",
    "Sunday": "रविवार",
    "Monday": "सोमवार",
    "Tuesday": "मंगलवार",
    "Wednesday": "बुधवार",
    "Thursday": "गुरुवार",
    "Friday": "शुक्रवार",
    "Saturday": "शनिवार",
    "Morning Duty": "सुबह की ड्यूटी",
    "Evening Duty": "शाम की ड्यूटी",
    "Night Duty": "रात की ड्यूटी",
    "Holiday": "छुट्टी",
    "Live Events & Holidays": "लाइव इवेंट्स और छुट्टियां",
    "Real holidays & cultural events for the selected month.": "चयनित महीने के लिए वास्तविक छुट्टियां और सांस्कृतिक कार्यक्रम।",
    "Calendar Language": "कैलेंडर भाषा",
    "Public Holiday": "सार्वजनिक अवकाश",
    "Live Event": "लाइव इवेंट",
    "No public holidays found.": "कोई सार्वजनिक अवकाश नहीं मिला।",
    "Try reloading or switching countries.": "पुनः लोड करने या कैलेंडर बदलने का प्रयास करें।",
    "Mark Day Off / Off Duty": "छुट्टी / ऑफ ड्यूटी के रूप में चिह्नित करें",
    "Shift Tracker Metrics": "शिफ्ट ट्रैकर आंकड़े",
    "Interactive Roster Canvas:": "इंटरैक्टिव रोस्टर कैनवास:",
    "and click any cell in the grid to color-code your roster. Double-click any cell to toggle on-off sticky notes.": "और अपने रोस्टर को रंग-कोड करने के लिए ग्रिड में किसी भी सेल पर क्लिक करें। स्टिकी नोट्स को चालू-बंद करने के लिए किसी भी सेल पर डबल-क्लिक करें।",
    "Double Click day cells to toggle & pin sticky notes": "स्टिकी नोट्स को टॉगल और पिन करने के लिए दिन के सेल पर डबल क्लिक करें",
    "Today": "आज",
    "Fully customized shift planner with live events": "लाइव इवेंट्स के साथ पूरी तरह से अनुकूलित शिफ्ट प्लानर",
    "Duty Palette": "ड्यूटी पैलेट",
    "Add Custom Shift": "कस्टम शिफ्ट जोड़ें",
    "Color Theme": "रंग थीम",
    "Start Time": "प्रारंभ समय",
    "End Time": "समाप्ति समय",
    "Save Shift": "शिफ्ट सहेजें",
    "Edit Shift": "शिफ्ट संपादित करें",
    "Delete Shift": "शिफ्ट हटाएं",
    "Sticky Note & Date Details": "स्टिकी नोट और तिथि विवरण",
    "Enable Sticky Note": "स्टिकी नोट सक्षम करें",
    "Toggle to display a post-it note on this day": "इस दिन पोस्ट-इट नोट प्रदर्शित करने के लिए टॉगल करें",
    "Assigned Duty Color-Code": "नियुक्त ड्यूटी रंग-कोड",
    "No Shift": "कोई शिफ्ट नहीं",
    "Paint shifts by clicking them directly on the grid": "सीधे ग्रिड पर क्लिक करके शिफ्ट पेंट करें",
    "Save Notes": "नोट्स सहेजें",
    "Calendar": "कैलेंडर",
    "Shift": "शिफ्ट",
    "Hours": "घंटे",
    "Add Shift": "शिफ्ट जोड़ें"
  }
};

export function translate(text: string, lang: LanguageCode): string {
  if (lang === "en" || !text) return text;
  
  // Try direct match
  const directMatch = TRANSLATIONS[lang]?.[text];
  if (directMatch) return directMatch;
  
  // Try substring replacement for common holidays in case of extra words
  const keys = Object.keys(TRANSLATIONS[lang] || {});
  for (const key of keys) {
    if (text.toLowerCase().includes(key.toLowerCase())) {
      return TRANSLATIONS[lang][key];
    }
  }
  
  return text;
}

export function getDutyShortForm(label: string, type: string, lang: LanguageCode): string {
  const normType = (type || "").toLowerCase();
  
  if (normType === "morning") {
    if (lang === "mr") return "स";
    if (lang === "hi") return "सु";
    return "M";
  }
  if (normType === "evening") {
    if (lang === "mr") return "सं";
    if (lang === "hi") return "शा";
    return "E";
  }
  if (normType === "night") {
    if (lang === "mr") return "रा";
    if (lang === "hi") return "रा";
    return "N";
  }
  if (normType === "holiday") {
    if (lang === "mr") return "सु";
    if (lang === "hi") return "छु";
    return "H";
  }

  // Fallback for custom duties - extract initials or first letters
  const cleanLabel = (label || "").trim();
  if (!cleanLabel) return "C";
  
  // If multi-word (e.g. "Over Time")
  const words = cleanLabel.split(/\s+/);
  if (words.length > 1) {
    const abbrev = words.map(w => w.charAt(0)).join("").toUpperCase();
    return abbrev.substring(0, 3);
  }
  
  // Take first 1 or 2 characters
  return cleanLabel.substring(0, Math.min(2, cleanLabel.length)).toUpperCase();
}

