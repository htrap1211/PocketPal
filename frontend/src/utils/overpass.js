const OVERPASS = "https://overpass-api.de/api/interpreter";

function getType(tags) {
  if (tags.healthcare === "counselling") return "counselling";
  if (tags.healthcare === "psychotherapist" || tags.office === "psychotherapist")
    return "psychotherapist";
  if (tags.healthcare === "mental_health") return "mental health";
  if (tags.amenity === "social_facility")
    return tags["social_facility:for"] || "social support";
  if (tags.amenity === "community_centre") return "community centre";
  if (tags.office === "therapist") return "therapist";
  return "support";
}

function getPriority(tags, mood) {
  const clinical =
    ["counselling", "psychotherapist", "mental_health"].includes(tags.healthcare) ||
    ["therapist", "psychotherapist"].includes(tags.office);
  const community = ["community_centre", "social_facility"].includes(tags.amenity);
  const m = mood ?? 3;
  if (m <= 2) return clinical ? 10 : community ? 6 : 3;
  if (m === 3) return clinical ? 8 : community ? 8 : 4;
  return clinical ? 5 : community ? 10 : 6;
}

export async function fetchSupportPlaces(lat, lon, mood) {
  const r = 5000;
  const q = `
[out:json][timeout:20];
(
  node["healthcare"="counselling"](around:${r},${lat},${lon});
  node["healthcare"="psychotherapist"](around:${r},${lat},${lon});
  node["healthcare"="mental_health"](around:${r},${lat},${lon});
  node["amenity"="social_facility"](around:${r},${lat},${lon});
  node["amenity"="community_centre"](around:${r},${lat},${lon});
  node["office"="therapist"](around:${r},${lat},${lon});
  node["office"="psychotherapist"](around:${r},${lat},${lon});
  way["healthcare"="counselling"](around:${r},${lat},${lon});
  way["amenity"="social_facility"](around:${r},${lat},${lon});
  way["amenity"="community_centre"](around:${r},${lat},${lon});
);
out center body;
`.trim();

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(q),
      signal: controller.signal,
    });
    clearTimeout(tid);
    const data = await res.json();
    return data.elements
      .filter((e) => e.tags?.name)
      .map((e) => ({
        id: e.id,
        name: e.tags.name,
        lat: e.lat ?? e.center?.lat,
        lon: e.lon ?? e.center?.lon,
        type: getType(e.tags),
        phone: e.tags.phone || e.tags["contact:phone"] || null,
        website: e.tags.website || e.tags["contact:website"] || null,
        hours: e.tags.opening_hours || null,
        priority: getPriority(e.tags, mood),
      }))
      .filter((p) => p.lat != null && p.lon != null);
  } catch {
    clearTimeout(tid);
    return [];
  }
}
