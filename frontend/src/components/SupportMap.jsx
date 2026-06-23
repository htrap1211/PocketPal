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

const TYPE_EMOJI = {
  counselling: "🗣️",
  psychotherapist: "🧠",
  "mental health": "💙",
  "social support": "🤝",
  "community centre": "🏘️",
  therapist: "💬",
};

function moodColor(mood) {
  return !mood || mood <= 2 ? "#c4854a" : "#9a9a9a";
}

// ── Vanilla Leaflet map (no react-leaflet) ────────────────────────────────────

function LeafletMap({ location, places, selected, onSelect, mood }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
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

    // User location marker with pulsing ring
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
    L.marker([location.lat, location.lon], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
  }, [places, selected]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

// ── UI states ─────────────────────────────────────────────────────────────────

function RadarLoader({ status }) {
  return (
    <div className="flex h-[300px] sm:h-[400px] flex-col items-center justify-center gap-[28px] bg-[#0d0c14]">
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
      <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
        {status === "locating" ? "locating you…" : "scanning nearby…"}
      </p>
    </div>
  );
}

function MapError() {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-[14px] bg-[#0d0c14] px-[24px] text-center">
      <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
        location unavailable
      </p>
      <p className="max-w-[280px] text-[14px] font-light leading-[1.5] text-ash">
        Enable location access to see nearby support services.
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[4px] rounded-[75px] border border-paper-white/20 px-[18px] py-[9px] text-[11px] font-normal text-smoke transition-colors hover:border-paper-white/50 hover:text-paper-white"
      >
        findahelpline.com →
      </a>
    </div>
  );
}

function MapEmpty() {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-[14px] bg-[#0d0c14] px-[24px] text-center">
      <p className="text-[11px] font-normal uppercase tracking-widest text-smoke">
        no places found within 5km
      </p>
      <p className="max-w-[280px] text-[14px] font-light leading-[1.5] text-ash">
        OSM data may be sparse here. Try:
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[4px] rounded-[75px] border border-paper-white/20 px-[18px] py-[9px] text-[11px] font-normal text-smoke transition-colors hover:border-paper-white/50 hover:text-paper-white"
      >
        findahelpline.com →
      </a>
    </div>
  );
}

function PlaceCard({ place, onClose }) {
  return (
    <div className="animate-fade-up border-t border-paper-white/10 bg-[#0d0c14] px-[20px] sm:px-[28px] py-[20px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="min-w-0 flex-1">
          <div className="mb-[8px] flex flex-wrap items-center gap-[8px]">
            <span>{TYPE_EMOJI[place.type] || "📍"}</span>
            <p className="text-[11px] font-normal uppercase tracking-widest text-smoke capitalize">
              {place.type}
            </p>
            <span className="text-smoke/30">·</span>
            <p className="text-[11px] font-normal text-smoke">{fmt(place.distance)} away</p>
          </div>
          <p className="text-[17px] sm:text-[18px] font-light leading-[1.3] text-paper-white">
            {place.name}
          </p>
          {place.hours && (
            <p className="mt-[8px] text-[12px] font-normal leading-[1.5] text-ash">
              {place.hours}
            </p>
          )}
          <div className="mt-[14px] flex flex-wrap gap-[8px]">
            {place.phone && (
              <a
                href={`tel:${place.phone.replace(/[\s\-\(\)]/g, "")}`}
                className="rounded-[75px] bg-paper-white/10 px-[14px] py-[7px] text-[11px] font-normal text-paper-white transition-colors hover:bg-paper-white/20"
              >
                📞 {place.phone}
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
                className="rounded-[75px] bg-paper-white/10 px-[14px] py-[7px] text-[11px] font-normal text-paper-white transition-colors hover:bg-paper-white/20"
              >
                website →
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close place details"
          className="flex-shrink-0 text-[20px] leading-none text-smoke/50 transition-colors hover:text-smoke"
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
    <div className="bg-[#0d0c14]">
      {places.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(selected?.id === p.id ? null : p)}
          className={`flex w-full items-center justify-between gap-[16px] border-t border-paper-white/[0.06] px-[20px] sm:px-[28px] py-[13px] text-left transition-colors first:border-t-0 hover:bg-paper-white/[0.04] ${
            selected?.id === p.id ? "bg-paper-white/[0.06]" : ""
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
            <p className="truncate text-[14px] font-light text-paper-white">{p.name}</p>
            <p className="hidden flex-shrink-0 text-[11px] capitalize text-smoke sm:block">
              {p.type}
            </p>
          </div>
          <p className="flex-shrink-0 text-[11px] text-smoke">{fmt(p.distance)}</p>
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
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (!navigator.geolocation) { setStatus("error"); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled.current) return;
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(loc);
        setStatus("fetching");
        try {
          const raw = await fetchSupportPlaces(loc.lat, loc.lon, lastMood);
          if (cancelled.current) return;
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
        } catch {
          if (!cancelled.current) setStatus("error");
        }
      },
      () => { if (!cancelled.current) setStatus("error"); },
      { timeout: 10000 },
    );

    return () => { cancelled.current = true; };
  }, []);

  if (status === "locating" || status === "fetching")
    return <RadarLoader status={status} />;
  if (status === "error") return <MapError />;
  if (status === "empty") return <MapEmpty />;

  return (
    <div className="animate-fade-in overflow-hidden">
      <div className="h-[300px] sm:h-[400px]">
        <LeafletMap
          location={location}
          places={places}
          selected={selected}
          onSelect={setSelected}
          mood={lastMood}
        />
      </div>
      {selected ? (
        <PlaceCard place={selected} onClose={() => setSelected(null)} />
      ) : (
        <NearbyList
          places={places.slice(0, 5)}
          selected={selected}
          onSelect={setSelected}
          mood={lastMood}
        />
      )}
    </div>
  );
}
