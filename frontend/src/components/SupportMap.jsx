import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchSupportPlaces } from "../utils/overpass.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const r = (d) => (d * Math.PI) / 180;
  const dLat = r(lat2 - lat1);
  const dLon = r(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function fmt(m) {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

const TYPE_LABEL = {
  counselling: "CO",
  psychotherapist: "PS",
  "mental health": "MH",
  "social support": "SS",
  "community centre": "CC",
  therapist: "TH",
};

function moodColor(mood) {
  return !mood || mood <= 2 ? "#c4854a" : "#9a9a9a";
}

async function fetchJsonWithTimeout(url, ms = 7000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("request failed");
    return await res.json();
  } finally {
    clearTimeout(tid);
  }
}

async function requestBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        label: "your current location",
        approximate: false,
      }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: true },
    );
  });
}

async function getApproximateLocation() {
  try {
    const d = await fetchJsonWithTimeout("https://ipapi.co/json/", 5000);
    if (d?.latitude && d?.longitude) {
      return {
        lat: d.latitude,
        lon: d.longitude,
        label: [d.city, d.region, d.country_name].filter(Boolean).join(", ") || "approximate area",
        approximate: true,
      };
    }
  } catch {}
  return null;
}

async function geocodeLocation(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const data = await fetchJsonWithTimeout(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`,
    8000,
  );
  const hit = data?.[0];
  if (!hit?.lat || !hit?.lon) return null;
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    label: hit.display_name,
    approximate: false,
  };
}

// ── Vanilla Leaflet map (no react-leaflet) ────────────────────────────────────

function LeafletMap({ location, places, selected, onSelect, mood }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const placeMarkersRef = useRef([]);
  const color = moodColor(mood);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([location.lat, location.lon], 14);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Recenter and move the location marker whenever the source location changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView([location.lat, location.lon], 14);

    const userIcon = L.divIcon({
      html: `<div style="position:relative;width:24px;height:24px;">
        <div class="pp-location-ring"></div>
        <div class="pp-location-ring pp-location-ring-2"></div>
        <div style="position:absolute;inset:7px;background:#c4854a;border-radius:50%;"></div>
      </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lon]);
    } else {
      userMarkerRef.current = L.marker([location.lat, location.lon], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [location]);

  // Sync place markers whenever places or selected changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    placeMarkersRef.current.forEach((m) => m.remove());
    placeMarkersRef.current = [];

    places.forEach((p) => {
      const active = selected?.id === p.id;
      const s = active ? 14 : 10;
      const icon = L.divIcon({
        html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};border:${active ? 2 : 1.5}px solid rgba(255,255,255,${active ? 0.7 : 0.3});box-shadow:0 0 ${active ? 12 : 4}px ${color}80;"></div>`,
        className: "",
        iconSize: [s, s],
        iconAnchor: [s / 2, s / 2],
      });
      const marker = L.marker([p.lat, p.lon], { icon })
        .on("click", () => onSelect(p))
        .addTo(map);
      placeMarkersRef.current.push(marker);
    });
  }, [places, selected, color, onSelect]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

// ── UI states ─────────────────────────────────────────────────────────────────

function RadarLoader({ status }) {
  return (
    <div className="neo-card flex h-[300px] flex-col items-center justify-center gap-[28px] sm:h-[400px]">
      <div className="relative h-[110px] w-[110px]">
        <div className="absolute inset-0 rounded-full border border-[#c4854a]/10" />
        <div className="absolute inset-[18%] rounded-full border border-[#c4854a]/15" />
        <div className="absolute inset-[36%] rounded-full border border-[#c4854a]/25" />
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(196,133,74,0.5) 0deg, rgba(196,133,74,0.08) 80deg, transparent 80deg)",
            animationDuration: "2.4s",
          }}
        />
        <div
          className="absolute inset-[28%] rounded-full border border-[#c4854a]/30 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div className="absolute inset-[46%] rounded-full bg-[#c4854a]" />
      </div>
      <p className="neo-label uppercase">
        {status === "locating" ? "locating you..." : "scanning nearby..."}
      </p>
    </div>
  );
}

function LocationControls({ query, setQuery, onSearch, onUseCurrent, disabled, error }) {
  return (
    <form
      onSubmit={onSearch}
      className="neo-card mb-[14px] flex flex-col gap-[10px] px-[20px] py-[14px] sm:flex-row sm:items-center sm:px-[28px]"
    >
      <label className="sr-only" htmlFor="support-location-search">
        Search city or postcode
      </label>
      <input
        id="support-location-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="city or postcode"
        disabled={disabled}
        className="neo-inset neo-focus min-h-[42px] flex-1 px-[14px] text-[13px] font-normal text-[#26313b] outline-none placeholder:text-[#6f7f8c]/55 disabled:opacity-50"
      />
      <div className="flex gap-[8px]">
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="neo-button min-h-[42px] px-[16px] text-[11px] font-semibold uppercase tracking-[0.04em] disabled:opacity-35"
        >
          search
        </button>
        <button
          type="button"
          onClick={onUseCurrent}
          disabled={disabled}
          className="neo-button-secondary min-h-[42px] px-[16px] text-[11px] font-semibold uppercase tracking-[0.04em] disabled:opacity-35"
        >
          use GPS
        </button>
      </div>
      {error && (
        <p className="text-[11px] font-normal leading-[1.4] text-[#c4854a]" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  );
}

function MapError() {
  return (
    <div className="neo-card flex h-[200px] flex-col items-center justify-center gap-[14px] px-[24px] text-center">
      <p className="neo-label uppercase">
        location unavailable
      </p>
      <p className="max-w-[280px] text-[14px] font-normal leading-[1.6] text-[#6f7f8c]">
        Search your city or allow GPS to see nearby support services.
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className="neo-button-secondary mt-[4px] px-[18px] py-[9px] text-[11px] font-semibold"
      >
        findahelpline.com
      </a>
    </div>
  );
}

function MapEmpty() {
  return (
    <div className="neo-card flex h-[200px] flex-col items-center justify-center gap-[14px] px-[24px] text-center">
      <p className="neo-label uppercase">
        no places found within 5km
      </p>
      <p className="max-w-[280px] text-[14px] font-normal leading-[1.6] text-[#6f7f8c]">
        OSM data may be sparse here. Try:
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className="neo-button-secondary mt-[4px] px-[18px] py-[9px] text-[11px] font-semibold"
      >
        findahelpline.com
      </a>
    </div>
  );
}

function PlaceCard({ place, onClose }) {
  return (
    <div className="neo-card mt-[14px] animate-fade-up px-[20px] py-[20px] sm:px-[28px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="min-w-0 flex-1">
          <div className="mb-[8px] flex flex-wrap items-center gap-[8px]">
            <span className="neo-inset flex h-[28px] w-[28px] items-center justify-center text-[10px] font-bold text-[#6f96b8]">
              {TYPE_LABEL[place.type] || "PL"}
            </span>
            <p className="neo-label uppercase capitalize">
              {place.type}
            </p>
            <p className="text-[11px] font-normal text-[#6f7f8c]">{fmt(place.distance)} away</p>
          </div>
          <p className="text-[17px] sm:text-[18px] font-bold leading-[1.3] text-[#26313b]">
            {place.name}
          </p>
          {place.hours && (
            <p className="mt-[8px] text-[12px] font-normal leading-[1.6] text-[#6f7f8c]">
              {place.hours}
            </p>
          )}
          <div className="mt-[14px] flex flex-wrap gap-[8px]">
            {place.phone && (
              <a
                href={`tel:${place.phone.replace(/[\s\-\(\)]/g, "")}`}
                className="neo-button-secondary px-[14px] py-[7px] text-[11px] font-semibold"
              >
                {place.phone}
              </a>
            )}
            {place.website && (
              <a
                href={
                  place.website.startsWith("http")
                    ? place.website
                    : `https://${place.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="neo-button-secondary px-[14px] py-[7px] text-[11px] font-semibold"
              >
                website
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close place details"
          className="flex-shrink-0 text-[20px] leading-none text-[#6f7f8c] transition-colors hover:text-[#26313b]"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function NearbyList({ places, selected, onSelect, mood }) {
  const color = moodColor(mood);
  return (
    <div className="mt-[14px] grid gap-[10px]">
      {places.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(selected?.id === p.id ? null : p)}
          className={`neo-card flex w-full items-center justify-between gap-[16px] px-[20px] py-[13px] text-left transition-colors sm:px-[28px] ${
            selected?.id === p.id ? "shadow-[inset_-5px_-5px_12px_rgba(255,255,255,0.86),inset_5px_5px_12px_rgba(145,162,176,0.22)]" : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-[12px]">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <p className="truncate text-[14px] font-semibold text-[#26313b]">{p.name}</p>
            <p className="hidden flex-shrink-0 text-[11px] capitalize text-[#6f7f8c] sm:block">
              {p.type}
            </p>
          </div>
          <p className="flex-shrink-0 text-[11px] text-[#6f7f8c]">{fmt(p.distance)}</p>
        </button>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SupportMap({ lastMood }) {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("locating");
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const cancelled = useRef(false);
  const requestIdRef = useRef(0);

  async function loadPlacesForLocation(loc, requestId = ++requestIdRef.current) {
    setLocation(loc);
    setSelected(null);
    setPlaces([]);
    setStatus("fetching");
    setSearchError("");

    const raw = await fetchSupportPlaces(loc.lat, loc.lon, lastMood);
    if (cancelled.current || requestId !== requestIdRef.current) return;

    const sorted = raw
      .map((p) => ({
        ...p,
        distance: haversine(loc.lat, loc.lon, p.lat, p.lon),
      }))
      .sort((a, b) => {
        const pd = b.priority - a.priority;
        return Math.abs(pd) > 2 ? pd : a.distance - b.distance;
      });

    setPlaces(sorted);
    setStatus(sorted.length > 0 ? "ready" : "empty");
  }

  async function useCurrentLocation() {
    const requestId = ++requestIdRef.current;
    setStatus("locating");
    setSearchError("");
    const loc = await requestBrowserLocation();
    if (cancelled.current || requestId !== requestIdRef.current) return;
    if (!loc) {
      setStatus(location ? "ready" : "error");
      setSearchError("GPS was unavailable. Try searching your city instead.");
      return;
    }
    try {
      await loadPlacesForLocation(loc, requestId);
    } catch {
      if (!cancelled.current) {
        setStatus("error");
        setSearchError("Could not load nearby resources for that location.");
      }
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    const requestId = ++requestIdRef.current;
    setStatus("fetching");
    setSearchError("");
    try {
      const loc = await geocodeLocation(query);
      if (cancelled.current || requestId !== requestIdRef.current) return;
      if (!loc) {
        setStatus(location ? "ready" : "error");
        setSearchError("I could not find that location. Try city, state or postcode.");
        return;
      }
      await loadPlacesForLocation(loc, requestId);
    } catch {
      if (!cancelled.current) {
        setStatus(location ? "ready" : "error");
        setSearchError("Location search is unavailable right now.");
      }
    }
  }

  useEffect(() => {
    cancelled.current = false;
    const requestId = ++requestIdRef.current;

    async function resolveLocation() {
      const gpsLoc = await requestBrowserLocation();
      if (gpsLoc) return gpsLoc;
      return getApproximateLocation();
    }

    resolveLocation().then(async (loc) => {
      if (cancelled.current || requestId !== requestIdRef.current) return;
      if (!loc) { setStatus("error"); return; }

      try {
        await loadPlacesForLocation(loc, requestId);
      } catch {
        if (!cancelled.current) setStatus("error");
      }
    });

    return () => { cancelled.current = true; };
  }, [lastMood]);

  const busy = status === "locating" || status === "fetching";

  return (
    <div className="animate-fade-in overflow-hidden">
      <LocationControls
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        onUseCurrent={useCurrentLocation}
        disabled={busy}
        error={searchError}
      />
      {busy && <RadarLoader status={status} />}
      {status === "error" && <MapError />}
      {status === "empty" && <MapEmpty />}
      {(status === "ready" || status === "empty") && location && (
        <>
      {location?.approximate && (
        <div className="neo-inset mb-[14px] flex items-center gap-[8px] px-[20px] py-[10px] sm:px-[28px]">
          <div className="h-[6px] w-[6px] rounded-full bg-[#c4854a]/60 flex-shrink-0" />
          <p className="text-[11px] font-normal text-[#6f7f8c]">
            approximate location{location.label ? ` · ${location.label}` : ""} · use GPS or search to refine
          </p>
        </div>
      )}
      <div className="neo-card overflow-hidden p-[10px]">
      <div className="h-[300px] overflow-hidden rounded-[14px] sm:h-[400px]">
        <LeafletMap
          location={location}
          places={places}
          selected={selected}
          onSelect={setSelected}
          mood={lastMood}
        />
      </div>
      </div>
      {status === "ready" && (
        selected ? (
          <PlaceCard place={selected} onClose={() => setSelected(null)} />
        ) : (
          <NearbyList
            places={places.slice(0, 5)}
            selected={selected}
            onSelect={setSelected}
            mood={lastMood}
          />
        )
      )}
        </>
      )}
    </div>
  );
}
