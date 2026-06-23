// Timezone → ISO country code. OS timezone is unaffected by VPN.
const TZ_TO_COUNTRY = {
  "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Brussels": "BE",
  "Europe/Amsterdam": "NL", "Europe/Zurich": "CH", "Europe/Vienna": "AT",
  "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI", "Europe/London": "GB", "Europe/Dublin": "IE",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Winnipeg": "CA",
  "America/Halifax": "CA", "America/St_Johns": "CA",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU",
  "Australia/Perth": "AU", "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Africa/Johannesburg": "ZA",
  "Asia/Tokyo": "JP",
  "Asia/Singapore": "SG",
  "Asia/Manila": "PH",
  "America/Mexico_City": "MX", "America/Monterrey": "MX", "America/Tijuana": "MX",
  "America/Sao_Paulo": "BR", "America/Manaus": "BR", "America/Fortaleza": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "Asia/Seoul": "KR",
  "Asia/Hong_Kong": "HK",
  "Asia/Jerusalem": "IL",
  "Asia/Karachi": "PK",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
};

function getCountryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_TO_COUNTRY[tz] ?? null;
  } catch { return null; }
}

const HELPLINES = {
  US: { country: "United States",    line: "988",               label: "Suicide & Crisis Lifeline",          extra: "call or text 988, 24/7" },
  CA: { country: "Canada",           line: "1-833-456-4566",    label: "Crisis Services Canada",             extra: "Kids Help Phone: 1-800-668-6868" },
  GB: { country: "United Kingdom",   line: "116 123",           label: "Samaritans",                         extra: "Childline (under 19): 0800 1111" },
  IE: { country: "Ireland",          line: "116 123",           label: "Samaritans",                         extra: "available 24/7, free" },
  AU: { country: "Australia",        line: "13 11 14",          label: "Lifeline",                           extra: "Kids Helpline: 1800 55 1800" },
  NZ: { country: "New Zealand",      line: "0800 543 354",      label: "Lifeline",                           extra: "Youthline: 0800 376 633" },
  IN: { country: "India",            line: "9152987821",        label: "iCall",                              extra: "Vandrevala Foundation: 1860-2662-345" },
  ZA: { country: "South Africa",     line: "0800 456 789",      label: "SADAG",                              extra: "SMS 31393, 24/7" },
  DE: { country: "Germany",          line: "0800 111 0 111",    label: "Telefonseelsorge",                   extra: "free, 24/7" },
  FR: { country: "France",           line: "3114",              label: "Numéro National Prévention Suicide", extra: "24/7" },
  BE: { country: "Belgium",          line: "0800 32 123",       label: "Zelfmoordlijn",                      extra: "free, 24/7" },
  NL: { country: "Netherlands",      line: "0800 0113",         label: "Stichting 113",                      extra: "chat at 113.nl" },
  CH: { country: "Switzerland",      line: "143",               label: "Die Dargebotene Hand",               extra: "free, 24/7" },
  AT: { country: "Austria",          line: "142",               label: "Telefonseelsorge",                   extra: "free, 24/7" },
  SE: { country: "Sweden",           line: "90101",             label: "Mind Självmordslinjen",              extra: "chat at mind.se" },
  NO: { country: "Norway",           line: "116 123",           label: "Mental Helse",                       extra: "free, 24/7" },
  DK: { country: "Denmark",          line: "70 201 201",        label: "Livslinien",                         extra: "free, 24/7" },
  FI: { country: "Finland",          line: "09 2525 0111",      label: "MIELI Crisis Line",                  extra: "free, 24/7" },
  JP: { country: "Japan",            line: "0120-279-338",      label: "Inochi no Denwa",                    extra: "24/7" },
  SG: { country: "Singapore",        line: "1800 221 4444",     label: "SOS",                                extra: "24/7" },
  PH: { country: "Philippines",      line: "1553",              label: "Hopeline",                           extra: "free, 24/7" },
  MX: { country: "Mexico",           line: "800-290-0024",      label: "SAPTEL",                             extra: "free, 24/7" },
  BR: { country: "Brazil",           line: "188",               label: "CVV",                                extra: "free, 24/7" },
  AR: { country: "Argentina",        line: "135",               label: "Centro de Asistencia al Suicida",    extra: "free, 24/7" },
  KR: { country: "South Korea",      line: "1393",              label: "Korea Suicide Prevention Hotline",   extra: "free, 24/7" },
  HK: { country: "Hong Kong",        line: "2382 0000",         label: "Samaritan Befrienders",              extra: "24/7" },
  IL: { country: "Israel",           line: "1201",              label: "ERAN",                               extra: "free, 24/7" },
  PK: { country: "Pakistan",         line: "0311-7786264",      label: "Umang helpline",                     extra: "9am–2am" },
  NG: { country: "Nigeria",          line: "08000700800",       label: "SURPIN",                             extra: "free" },
  KE: { country: "Kenya",            line: "0800 720 990",      label: "Befrienders Kenya",                  extra: "free" },
};

export const HELPLINES_LIST = Object.entries(HELPLINES)
  .map(([code, h]) => ({ code, ...h }))
  .sort((a, b) => a.country.localeCompare(b.country));

const FALLBACK = {
  country: null,
  line: "befrienders.org",
  label: "Befrienders Worldwide",
  extra: "find your local helpline at befrienders.org",
};

// Locale-based fallback — uses browser language tag, not physical location.
export function getHelpline() {
  try {
    const region = new Intl.Locale(navigator.language).region;
    if (region && HELPLINES[region]) return HELPLINES[region];
  } catch {
    const parts = (navigator.language || "").split(/[-_]/);
    if (parts.length > 1) {
      const code = parts[parts.length - 1].toUpperCase();
      if (HELPLINES[code]) return HELPLINES[code];
    }
  }
  return FALLBACK;
}

async function fetchWithTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return await res.json();
  } finally {
    clearTimeout(tid);
  }
}

// Resolve helpline by physical location.
// Chain: timezone (VPN-proof) → IP geo → GPS → locale fallback.
export async function getHelplineByGPS() {
  // 1. OS timezone — instant, no network, unaffected by VPN.
  const tzCode = getCountryFromTimezone();
  if (tzCode && HELPLINES[tzCode]) return HELPLINES[tzCode];

  // 2a. ip-api.com — accurate EU coverage, no key, no permission needed.
  try {
    const data = await fetchWithTimeout("https://ip-api.com/json/?fields=countryCode");
    const code = data?.countryCode?.toUpperCase();
    if (code && HELPLINES[code]) return HELPLINES[code];
  } catch {}

  // 2b. ipapi.co — different IP database as secondary.
  try {
    const data = await fetchWithTimeout("https://ipapi.co/json/");
    const code = data?.country_code?.toUpperCase();
    if (code && HELPLINES[code]) return HELPLINES[code];
  } catch {}

  // 2. GPS + reverse geocode — more precise, may show permission prompt.
  if (navigator.geolocation) {
    const gpsResult = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const data = await fetchWithTimeout(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
            );
            const code = data?.countryCode?.toUpperCase();
            resolve(HELPLINES[code] || null);
          } catch {
            resolve(null);
          }
        },
        () => resolve(null),
        { timeout: 8000, maximumAge: 300_000 },
      );
    });
    if (gpsResult) return gpsResult;
  }

  // 3. Locale fallback — approximate, based on browser language setting.
  return getHelpline();
}
