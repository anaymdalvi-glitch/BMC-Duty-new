import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback local holiday lists for popular countries to guarantee standard offline functionality
const OFFLINE_FALLBACKS: Record<string, Array<{ date: string; name: string; type: "holiday" | "event"; description: string }>> = {
  US: [
    { date: "2026-01-01", name: "New Year's Day", type: "holiday", description: "First day of the year." },
    { date: "2026-01-19", name: "Martin Luther King Jr. Day", type: "holiday", description: "Honoring the civil rights leader." },
    { date: "2026-02-16", name: "Presidents' Day", type: "holiday", description: "Celebration of all U.S. presidents." },
    { date: "2026-05-25", name: "Memorial Day", type: "holiday", description: "Remembering military personnel." },
    { date: "2026-06-19", name: "Juneteenth", type: "holiday", description: "Commemorating emancipation of enslaved African Americans." },
    { date: "2026-07-04", name: "Independence Day", type: "holiday", description: "U.S. National Day marking independence." },
    { date: "2026-09-07", name: "Labor Day", type: "holiday", description: "Honoring the labor movement." },
    { date: "2026-10-12", name: "Columbus Day / Indigenous Peoples' Day", type: "holiday", description: "Fall holiday honoring history." },
    { date: "2026-11-11", name: "Veterans Day", type: "holiday", description: "Honoring military veterans." },
    { date: "2026-11-26", name: "Thanksgiving", type: "holiday", description: "Traditional day of giving thanks." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Christian holiday celebrating the birth of Jesus." }
  ],
  IN: [
    { date: "2026-01-26", name: "Republic Day", type: "holiday", description: "Celebrating the adoption of the Indian Constitution." },
    { date: "2026-03-03", name: "Holi", type: "holiday", description: "Festival of colors and spring." },
    { date: "2026-04-02", name: "Mahavir Jayanti", type: "holiday", description: "Birth of Lord Mahavira." },
    { date: "2026-04-03", name: "Good Friday", type: "holiday", description: "Christian day of remembrance." },
    { date: "2026-08-15", name: "Independence Day", type: "holiday", description: "Indian National Day marking freedom from British rule." },
    { date: "2026-09-05", name: "Janmashtami", type: "holiday", description: "Birth of Lord Krishna." },
    { date: "2026-10-02", name: "Gandhi Jayanti", type: "holiday", description: "Honoring Mahatma Gandhi's birthday." },
    { date: "2026-10-20", name: "Dussehra", type: "holiday", description: "Triumph of good over evil." },
    { date: "2026-11-08", name: "Diwali", type: "holiday", description: "The festival of lights." },
    { date: "2026-11-24", name: "Guru Nanak Jayanti", type: "holiday", description: "Celebrating the birth of Guru Nanak." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Global winter holiday." }
  ],
  GB: [
    { date: "2026-01-01", name: "New Year's Day", type: "holiday", description: "Traditional New Year holiday." },
    { date: "2026-04-03", name: "Good Friday", type: "holiday", description: "Christian spring bank holiday." },
    { date: "2026-04-06", name: "Easter Monday", type: "holiday", description: "Monday following Easter Sunday." },
    { date: "2026-05-04", name: "Early May Bank Holiday", type: "holiday", description: "May Day bank holiday." },
    { date: "2026-05-25", name: "Spring Bank Holiday", type: "holiday", description: "Late May holiday representing early summer." },
    { date: "2026-08-31", name: "Summer Bank Holiday", type: "holiday", description: "Late August long weekend in England and Wales." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Celebrated UK-wide." },
    { date: "2026-12-26", name: "Boxing Day", type: "holiday", description: "Traditional day of shopping and giving." }
  ],
  CA: [
    { date: "2026-01-01", name: "New Year's Day", type: "holiday", description: "Start of the calendar year." },
    { date: "2026-04-03", name: "Good Friday", type: "holiday", description: "Remembrance of Good Friday." },
    { date: "2026-05-18", name: "Victoria Day", type: "holiday", description: "Honoring Queen Victoria's birthday." },
    { date: "2026-07-01", name: "Canada Day", type: "holiday", description: "Celebrating confederation of Canada." },
    { date: "2026-08-03", name: "Civic Holiday", type: "holiday", description: "Mid-summer provincial day off." },
    { date: "2026-09-07", name: "Labour Day", type: "holiday", description: "First Monday of September." },
    { date: "2026-10-12", name: "Thanksgiving", type: "holiday", description: "Second Monday of October." },
    { date: "2026-11-11", name: "Remembrance Day", type: "holiday", description: "Honoring military veterans and service." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Traditional winter holiday." },
    { date: "2026-12-26", name: "Boxing Day", type: "holiday", description: "Post-Christmas day off." }
  ],
  AU: [
    { date: "2026-01-01", name: "New Year's Day", type: "holiday", description: "Welcoming the new year." },
    { date: "2026-01-26", name: "Australia Day", type: "holiday", description: "National day of Australia." },
    { date: "2026-04-03", name: "Good Friday", type: "holiday", description: "Remembrance Friday." },
    { date: "2026-04-06", name: "Easter Monday", type: "holiday", description: "Easter public holiday." },
    { date: "2026-04-25", name: "ANZAC Day", type: "holiday", description: "Commemorating Australian and New Zealand Army Corps." },
    { date: "2026-06-08", name: "King's Birthday", type: "holiday", description: "Celebrating the official birthday of the monarch." },
    { date: "2026-10-05", name: "Labour Day", type: "holiday", description: "Spring labour milestone in several states." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Summer Christmas celebration." },
    { date: "2026-12-26", name: "Boxing Day", type: "holiday", description: "Proclamation Day in South Australia." }
  ],
  SG: [
    { date: "2026-01-01", name: "New Year's Day", type: "holiday", description: "First day of the calendar year." },
    { date: "2026-02-17", name: "Chinese New Year", type: "holiday", description: "Lunar New Year celebration." },
    { date: "2026-04-03", name: "Good Friday", type: "holiday", description: "Christian public holiday." },
    { date: "2026-05-01", name: "Labour Day", type: "holiday", description: "International Worker's Day." },
    { date: "2026-05-31", name: "Vesak Day", type: "holiday", description: "Buddhist festival of light." },
    { date: "2026-08-09", name: "National Day", type: "holiday", description: "Commemorating Singaporean Independence." },
    { date: "2026-11-09", name: "Deepavali", type: "holiday", description: "Hindu festival of lights." },
    { date: "2026-12-25", name: "Christmas Day", type: "holiday", description: "Global holiday." }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint to fetch actual live events & holidays
  app.post("/api/calendar/events", async (req, res) => {
    try {
      const { year, month, country, countryCode, language } = req.body;
      
      if (!year || !month) {
        return res.status(400).json({ error: "Year and Month are required parameters." });
      }

      const targetCountry = country || "India";
      const targetCode = (countryCode || "IN").toUpperCase();
      const lang = language || "en";

      let isQuotaExceeded = false;

      // Attempt to use Gemini API if the key exists
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const prompt = `List the official public holidays and major real-world live events (e.g. festivals, sports events, major concerts, public conventions) happening in ${targetCountry} during ${month} ${year}. 
Ensure the dates are mathematically correct for ${month} ${year}. For example, if year is ${year} and month is ${month}, dates must be in the exact format YYYY-MM-DD. 
If there are no major events or holidays, you can suggest relevant cultural milestones or seasons. Use Google Search to get actual accurate information.
${lang === "mr" ? "CRITICAL: Please write the entire JSON response (the 'name' and 'description' fields) in Marathi language (मराठी)." : lang === "hi" ? "CRITICAL: Please write the entire JSON response (the 'name' and 'description' fields) in Hindi language (हिंदी)." : "Please write the response in English."}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: {
                      type: Type.STRING,
                      description: "The date of the holiday or event in YYYY-MM-DD format.",
                    },
                    name: {
                      type: Type.STRING,
                      description: "The name of the holiday or event.",
                    },
                    type: {
                      type: Type.STRING,
                      description: "Must be exactly 'holiday' or 'event'.",
                    },
                    description: {
                      type: Type.STRING,
                      description: "A brief, one-sentence description explaining what this is.",
                    },
                  },
                  required: ["date", "name", "type", "description"],
                },
              },
            },
          });

          if (response.text) {
            const data = JSON.parse(response.text.trim());
            // Filter list to keep only events within the chosen month/year
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
            const formattedMonthStr = String(monthIndex + 1).padStart(2, "0");
            const prefix = `${year}-${formattedMonthStr}-`;
            
            const filteredData = data.filter((item: any) => item.date && item.date.startsWith(prefix));
            return res.json({ events: filteredData, source: "gemini-live" });
          }
        } catch (geminiError: any) {
          console.warn("Gemini API call was bypassed or limit reached. Reverting to local fallback calendar events database.");
          const errorStr = JSON.stringify(geminiError) || "";
          const errorMsg = geminiError?.message || String(geminiError) || "";
          if (
            errorStr.includes("429") || 
            errorStr.includes("quota") || 
            errorStr.includes("LIMIT") || 
            errorStr.includes("EXHAUSTED") ||
            errorMsg.includes("429") || 
            errorMsg.includes("quota") || 
            errorMsg.includes("LIMIT") || 
            errorMsg.includes("EXHAUSTED")
          ) {
            isQuotaExceeded = true;
          }
        }
      }

      // Offline Fallback System if Gemini is not set up or fails
      const fallbackTranslations: Record<string, Record<string, { name: string, desc: string }>> = {
        mr: {
          "Republic Day": { name: "प्रजासत्ताक दिन", desc: "भारतीय राज्यघटना लागू झाल्याचा उत्सव." },
          "Holi": { name: "होळी", desc: "रंग आणि वसंत ऋतूचा सण." },
          "Mahavir Jayanti": { name: "महावीर जयंती", desc: "भगवान महावीरांचा जन्मदिवस." },
          "Good Friday": { name: "गुड फ्रायडे", desc: "ख्रिश्चन स्मरण दिन." },
          "Independence Day": { name: "स्वातंत्र्य दिन", desc: "ब्रिटिश राजवटीपासून मिळालेल्या स्वातंत्र्याचा राष्ट्रीय दिवस." },
          "Janmashtami": { name: "श्रीकृष्ण जन्माष्टमी", desc: "भगवान श्रीकृष्णाचा जन्मोत्सव." },
          "Gandhi Jayanti": { name: "गांधी जयंती", desc: "महात्मा गांधी यांच्या जयंती निमित्त आदर." },
          "Dussehra": { name: "दसरा", desc: "वाईटावर चांगल्याचा विजय." },
          "Diwali": { name: "दिवाळी", desc: "दिव्यांचा सण, दीपावली." },
          "Guru Nanak Jayanti": { name: "गुरुनानक जयंती", desc: "गुरू नानक देव यांच्या जयंतीचा उत्सव." },
          "Christmas Day": { name: "नाताळ", desc: "येशू ख्रिस्ताच्या जन्माचा उत्सव." }
        },
        hi: {
          "Republic Day": { name: "गणतंत्र दिवस", desc: "भारतीय संविधान लागू होने का उत्सव।" },
          "Holi": { name: "होली", desc: "रोशनी और वसंत का त्योहार।" },
          "Mahavir Jayanti": { name: "महावीर जयंती", desc: "भगवान महावीर की जयंती।" },
          "Good Friday": { name: "गुड फ्राइड", desc: "ईसाई धर्म का शोक और स्मरण दिवस।" },
          "Independence Day": { name: "स्वतंत्रता दिवस", desc: "ब्रिटिश शासन से मुक्ति का राष्ट्रीय दिवस।" },
          "Janmashtami": { name: "जन्माष्टमी", desc: "भगवान कृष्ण का जन्मोत्सव।" },
          "Gandhi Jayanti": { name: "गांधी जयंती", desc: "महात्मा गांधी की जयंती का सम्मान।" },
          "Dussehra": { name: "दशहरा", desc: "बुराई पर अच्छाई की जीत का प्रतीक।" },
          "Diwali": { name: "दीवाली", desc: "रोशनी का त्योहार, दीपावली।" },
          "Guru Nanak Jayanti": { name: "गुरु नानक जयंती", desc: "गुरु नानक देव जी की जयंती।" },
          "Christmas Day": { name: "क्रिसमस", desc: "प्रभु यीशु मसीह के जन्म का त्योहार।" }
        }
      };

      const matchedHolidays = OFFLINE_FALLBACKS[targetCode] || OFFLINE_FALLBACKS["US"];
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      const formattedMonthStr = String(monthIndex + 1).padStart(2, "0");
      const prefix = `${year}-${formattedMonthStr}-`;

      const monthHolidays = matchedHolidays
        .map(h => {
          // Adjust year to requested year
          const datePart = h.date.substring(5); // e.g. "07-04"
          let name = h.name;
          let description = h.description;
          if (lang === "mr" && fallbackTranslations.mr[h.name]) {
            name = fallbackTranslations.mr[h.name].name;
            description = fallbackTranslations.mr[h.name].desc;
          } else if (lang === "hi" && fallbackTranslations.hi[h.name]) {
            name = fallbackTranslations.hi[h.name].name;
            description = fallbackTranslations.hi[h.name].desc;
          }
          return {
            ...h,
            name,
            description,
            date: `${year}-${datePart}`
          };
        })
        .filter(h => h.date.startsWith(prefix));

      // Generate a few dynamic local placeholder events based on selected country to make it feel alive!
      const fallbackEvents = [...monthHolidays];
      if (fallbackEvents.length === 0) {
        // Add a placeholder weekend market or local assembly so the calendar is never empty
        fallbackEvents.push({
          date: `${year}-${formattedMonthStr}-15`,
          name: `${targetCountry} Farmers' Market & Cultural Fair`,
          type: "event",
          description: "Monthly local fair featuring fresh regional goods, crafts, and food stalls."
        });
        fallbackEvents.push({
          date: `${year}-${formattedMonthStr}-28`,
          name: "Community Sports & Wellness Meet",
          type: "event",
          description: "A neighborhood gathering for outdoor group yoga, athletics, and social networking."
        });
      }

      return res.json({ events: fallbackEvents, source: isQuotaExceeded ? "offline-fallback-quota" : "offline-fallback" });
    } catch (error: any) {
      console.error("Error in /api/calendar/events:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
