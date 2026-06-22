// Lightweight theme extraction + correlation engine.
// Keyword matching only — no ML, no inference, no diagnosis.

export const THEME_KEYWORDS = {
  school:  ["school","class","classes","test","exam","homework","grade","grades","teacher","study","studying","studied","assignment","project","lecture","university","college","math","essay","quiz","gpa","tutor","learning","semester","finals","midterm"],
  friends: ["friend","friends","hang out","hangout","hung out","social","party","parties","group","bestie","bff","crew","squad","classmate","people","someone","texted","met up","hanging"],
  family:  ["mom","dad","parent","parents","sister","brother","family","home","sibling","grandma","grandpa","grandmother","grandfather","aunt","uncle","cousin","stepmom","stepdad","household"],
  sports:  ["sport","sports","soccer","basketball","football","tennis","swim","swimming","ran","run","running","gym","workout","practice","game","match","team","training","exercise","yoga","dance","dancing","track","volleyball","baseball","softball","lacrosse","hockey","hiking","cycling","bike","biking"],
  sleep:   ["sleep","slept","tired","exhausted","insomnia","rest","rested","nap","napped","bed","awake","oversleep","fatigue","sleepy","woke up","stayed up","late night","couldn't sleep"],
  health:  ["sick","illness","ill","health","doctor","medicine","headache","pain","hurt","stomach","cold","flu","anxious","anxiety","nervous","worried","stress","stressed","body","energy","appetite"],
  hobbies: ["art","draw","drawing","drew","paint","painting","music","guitar","piano","drums","sing","singing","read","reading","book","game","gaming","video game","cook","cooking","bake","baking","craft","write","writing","poem","creative","film","movie","movies","photography","code","coding","podcast","journal"],
};

export const THEME_EMOJI = {
  school:  "📚",
  friends: "👥",
  family:  "🏠",
  sports:  "⚽",
  sleep:   "😴",
  health:  "💊",
  hobbies: "🎨",
};

// Returns array of theme names present in text.
export function extractThemes(text) {
  if (!text || !text.trim()) return [];
  const lower = text.toLowerCase();
  return Object.entries(THEME_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([theme]) => theme);
}

// Build a safe memory context string from recent check-ins.
// Only references theme categories, never quotes user text verbatim.
export function buildMemoryContext(recentCheckins) {
  if (!recentCheckins?.length) return null;
  const seen = new Set();
  for (const c of recentCheckins) {
    extractThemes(c.note || "").forEach((t) => seen.add(t));
  }
  if (!seen.size) return null;
  return `Topics this student has mentioned recently: ${[...seen].join(", ")}.`;
}

// Per-theme stats: count + average mood.
export function computeThemeStats(checkins) {
  const map = {};
  for (const c of checkins) {
    for (const theme of extractThemes(c.note || "")) {
      if (!map[theme]) map[theme] = { count: 0, total: 0 };
      map[theme].count++;
      map[theme].total += c.mood;
    }
  }
  return Object.entries(map)
    .map(([theme, { count, total }]) => ({
      theme,
      count,
      averageMood: +(total / count).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);
}

// Wellness profile: classify themes as positive / stress factors.
export function computeProfile(checkins) {
  const stats = computeThemeStats(checkins);
  return {
    positiveFactors: stats.filter((t) => t.averageMood >= 3.5).map((t) => t.theme),
    stressFactors:   stats.filter((t) => t.averageMood < 2.8).map((t) => t.theme),
    topThemes:       stats.slice(0, 5).map((t) => t.theme),
  };
}

// Longest consecutive-day streak within a set of check-ins.
export function calcLongestStreak(checkins) {
  if (!checkins.length) return 0;
  const MS = 86_400_000;
  const toDay = (iso) => {
    const d = new Date(iso);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const days = [...new Set(checkins.map((c) => toDay(c.date)))].sort(
    (a, b) => a - b,
  );
  let max = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    cur = days[i] - days[i - 1] === MS ? cur + 1 : 1;
    if (cur > max) max = cur;
  }
  return max;
}
