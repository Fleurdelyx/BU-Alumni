// Philippine province/region center coordinates.
// Derived from dr5hn/countries-states-cities-database (ODbL v1.0).
// https://github.com/dr5hn/countries-states-cities-database
export type PhLocation = { lat: number; lng: number; name: string };

export const PH_LOCATION_MAP: Record<string, PhLocation> = {
  'abra': { lat: 17.58, lng: 120.8, name: 'Abra' },
  'agusandelnorte': { lat: 8.92, lng: 125.46, name: 'Agusan del Norte' },
  'agusandelsur': { lat: 8.36, lng: 125.71, name: 'Agusan del Sur' },
  'aklan': { lat: 11.6297894, lng: 122.2481177, name: 'Aklan' },
  'albay': { lat: 13.216667, lng: 123.55, name: 'Albay' },
  'antique': { lat: 11.1705066, lng: 122.083333, name: 'Antique' },
  'apayao': { lat: 18.12, lng: 121.19, name: 'Apayao' },
  'aurora': { lat: 16.9908811, lng: 121.6358, name: 'Aurora' },
  'autonomousregioninmuslimmindanao': { lat: 7.2242033, lng: 124.2470164, name: 'Autonomous Region in Muslim Mindanao' },
  'basilan': { lat: 6.5649821, lng: 122.0649183, name: 'Basilan' },
  'bataan': { lat: 14.6436031, lng: 120.4657622, name: 'Bataan' },
  'batanes': { lat: 20.6442465, lng: 121.8939456, name: 'Batanes' },
  'batangas': { lat: 13.7564651, lng: 121.0583076, name: 'Batangas' },
  'benguet': { lat: 16.52, lng: 120.69, name: 'Benguet' },
  'bicol': { lat: 13.0764489, lng: 123.5162387, name: 'Bicol' },
  'biliran': { lat: 11.5853547, lng: 124.4854627, name: 'Biliran' },
  'bohol': { lat: 9.833333, lng: 124.1615579, name: 'Bohol' },
  'bukidnon': { lat: 8.022778, lng: 124.998611, name: 'Bukidnon' },
  'bulacan': { lat: 15, lng: 121.083333, name: 'Bulacan' },
  'cagayan': { lat: 18, lng: 121.833333, name: 'Cagayan' },
  'cagayanvalley': { lat: 17.6722156, lng: 121.8831043, name: 'Cagayan Valley' },
  'calabarzon': { lat: 14.1658314, lng: 121.3535577, name: 'Calabarzon' },
  'camarinesnorte': { lat: 14.166667, lng: 122.75, name: 'Camarines Norte' },
  'camarinessur': { lat: 13.6428216, lng: 123.3282338, name: 'Camarines Sur' },
  'camiguin': { lat: 9.1732164, lng: 124.7298765, name: 'Camiguin' },
  'capiz': { lat: 11.3852987, lng: 122.6377315, name: 'Capiz' },
  'caraga': { lat: 9.2517336, lng: 125.851666, name: 'Caraga' },
  'catanduanes': { lat: 13.833333, lng: 124.25, name: 'Catanduanes' },
  'cavite': { lat: 14.4820919, lng: 120.908919, name: 'Cavite' },
  'cebu': { lat: 10.2935639, lng: 123.9019209, name: 'Cebu' },
  'centralluzon': { lat: 15.3942729, lng: 120.6872959, name: 'Central Luzon' },
  'centralvisayas': { lat: 10.4734504, lng: 123.8648083, name: 'Central Visayas' },
  'cordilleraadministrative': { lat: 17.3597101, lng: 121.0716923, name: 'Cordillera Administrative' },
  'cotabato': { lat: 7.2237628, lng: 124.2467062, name: 'Cotabato' },
  'davao': { lat: 7.0648306, lng: 125.6080623, name: 'Davao' },
  'davaodeoro': { lat: 7.45, lng: 126.07, name: 'Davao de Oro' },
  'davaodelnorte': { lat: 7.6179228, lng: 125.6832687, name: 'Davao del Norte' },
  'davaodelsur': { lat: 6.6983658, lng: 125.3612135, name: 'Davao del Sur' },
  'davaooccidental': { lat: 6.27, lng: 125.6, name: 'Davao Occidental' },
  'davaooriental': { lat: 7.166667, lng: 126.333333, name: 'Davao Oriental' },
  'dinagatislands': { lat: 10.1577932, lng: 125.5851827, name: 'Dinagat Islands' },
  'easternsamar': { lat: 11.73, lng: 125.37, name: 'Eastern Samar' },
  'easternvisayas': { lat: 11.2945278, lng: 124.9959508, name: 'Eastern Visayas' },
  'guimaras': { lat: 10.5730629, lng: 122.6238907, name: 'Guimaras' },
  'ifugao': { lat: 16.87, lng: 121.22, name: 'Ifugao' },
  'ilocos': { lat: 17.2, lng: 120.5, name: 'Ilocos' },
  'ilocosnorte': { lat: 18.166667, lng: 120.75, name: 'Ilocos Norte' },
  'ilocossur': { lat: 17.2, lng: 120.5, name: 'Ilocos Sur' },
  'iloilo': { lat: 10.6932884, lng: 122.5732604, name: 'Iloilo' },
  'isabela': { lat: 17, lng: 122, name: 'Isabela' },
  'kalinga': { lat: 17.46, lng: 121.31, name: 'Kalinga' },
  'launion': { lat: 16.5735957, lng: 120.4089899, name: 'La Union' },
  'laguna': { lat: 14.1696476, lng: 121.3336526, name: 'Laguna' },
  'lanaodelnorte': { lat: 7.9579723, lng: 123.9021124, name: 'Lanao del Norte' },
  'lanaodelsur': { lat: 7.8776443, lng: 124.3754759, name: 'Lanao del Sur' },
  'leyte': { lat: 10.7841157, lng: 124.892321, name: 'Leyte' },
  'maguindanaodelnorte': { lat: 7.1088356, lng: 124.2072945, name: 'Maguindanao del Norte' },
  'maguindanaodelsur': { lat: 6.9234196, lng: 124.5365357, name: 'Maguindanao del Sur' },
  'marinduque': { lat: 13.416667, lng: 121.95, name: 'Marinduque' },
  'masbate': { lat: 12.3710899, lng: 123.6239223, name: 'Masbate' },
  'mimaropa': { lat: 13.0106436, lng: 121.4115747, name: 'Mimaropa' },
  'misamisoccidental': { lat: 8.3374903, lng: 123.7070619, name: 'Misamis Occidental' },
  'misamisoriental': { lat: 8.6534807, lng: 124.8235205, name: 'Misamis Oriental' },
  'mountainprovince': { lat: 17.11, lng: 121.16, name: 'Mountain Province' },
  'nationalcapitalregionmetromanila': { lat: 14.5800297, lng: 120.985536, name: 'National Capital Region (Metro Manila)' },
  'negrosoccidental': { lat: 10.416667, lng: 123, name: 'Negros Occidental' },
  'negrosoriental': { lat: 9.75, lng: 123, name: 'Negros Oriental' },
  'northernmindanao': { lat: 8.3979549, lng: 124.710688, name: 'Northern Mindanao' },
  'northernsamar': { lat: 12.42, lng: 124.81, name: 'Northern Samar' },
  'nuevaecija': { lat: 15.583333, lng: 121, name: 'Nueva Ecija' },
  'nuevavizcaya': { lat: 16.35, lng: 121.13, name: 'Nueva Vizcaya' },
  'occidentalmindoro': { lat: 13.0000021, lng: 120.9166666, name: 'Occidental Mindoro' },
  'orientalmindoro': { lat: 13.2, lng: 121.2, name: 'Oriental Mindoro' },
  'palawan': { lat: 9.8778426, lng: 118.6764919, name: 'Palawan' },
  'pampanga': { lat: 15.0519635, lng: 120.6445398, name: 'Pampanga' },
  'pangasinan': { lat: 15.916667, lng: 120.333333, name: 'Pangasinan' },
  'quezon': { lat: 14.0067037, lng: 122.1827232, name: 'Quezon' },
  'quirino': { lat: 16.283333, lng: 121.583333, name: 'Quirino' },
  'rizal': { lat: 14.65, lng: 121.25, name: 'Rizal' },
  'romblon': { lat: 12.5778016, lng: 122.269146, name: 'Romblon' },
  'sarangani': { lat: 5.874722, lng: 125.275278, name: 'Sarangani' },
  'siquijor': { lat: 9.18, lng: 123.58, name: 'Siquijor' },
  'soccsksargen': { lat: 6.5647277, lng: 124.4840255, name: 'Soccsksargen' },
  'sorsogon': { lat: 12.9707848, lng: 124.0052543, name: 'Sorsogon' },
  'southcotabato': { lat: 6.2855239, lng: 124.9333096, name: 'South Cotabato' },
  'southernleyte': { lat: 10.3475099, lng: 125.1250896, name: 'Southern Leyte' },
  'sultankudarat': { lat: 6.5556705, lng: 124.3271496, name: 'Sultan Kudarat' },
  'sulu': { lat: 5.9942808, lng: 121.0787926, name: 'Sulu' },
  'surigaodelnorte': { lat: 9.7022868, lng: 125.5464831, name: 'Surigao del Norte' },
  'surigaodelsur': { lat: 8.84, lng: 126.15, name: 'Surigao del Sur' },
  'tarlac': { lat: 15.4861218, lng: 120.5893473, name: 'Tarlac' },
  'tawitawi': { lat: 5.2057, lng: 120.0265, name: 'Tawi-Tawi' },
  'westernsamar': { lat: 11.833333, lng: 125, name: 'Western Samar' },
  'westernvisayas': { lat: 11.2367324, lng: 122.6878187, name: 'Western Visayas' },
  'zambales': { lat: 15.23, lng: 120.12, name: 'Zambales' },
  'zamboangadelnorte': { lat: 8, lng: 122.666667, name: 'Zamboanga del Norte' },
  'zamboangadelsur': { lat: 7.9043, lng: 123.3194, name: 'Zamboanga del Sur' },
  'zamboangapeninsula': { lat: 7.7787234, lng: 122.7570828, name: 'Zamboanga Peninsula' },
  'zamboangasibugay': { lat: 7.7877097, lng: 122.5744217, name: 'Zamboanga Sibugay' },
};

function normalizeLoc(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// Generate a few cleaned variants of the input to handle prefixes/suffixes
// like "Province of Batangas", "City of Manila", "Batangas City", etc.
function keyVariants(input: string): string[] {
  const key = normalizeLoc(input);
  const stripped = key
    .replace(/^provinceof/, '')
    .replace(/^cityof/, '')
    .replace(/^regionof/, '')
    .replace(/city$/, '')
    .replace(/province$/, '');
  const twice = stripped
    .replace(/^provinceof/, '')
    .replace(/^cityof/, '')
    .replace(/^regionof/, '')
    .replace(/city$/, '')
    .replace(/province$/, '');
  return Array.from(new Set([key, stripped, twice])).filter(Boolean);
}

// Exact aliases for names/abbreviations that don't match the auto-generated
// province keys (e.g. NCR cities, Roman numeral regions, renamed provinces).
const PH_LOCATION_ALIASES: Record<string, string> = {
  // NCR cities -> Metro Manila center
  'caloocan': 'nationalcapitalregionmetromanila',
  'caloocancity': 'nationalcapitalregionmetromanila',
  'laspinas': 'nationalcapitalregionmetromanila',
  'laspinascity': 'nationalcapitalregionmetromanila',
  'makati': 'nationalcapitalregionmetromanila',
  'makaticity': 'nationalcapitalregionmetromanila',
  'malabon': 'nationalcapitalregionmetromanila',
  'malaboncity': 'nationalcapitalregionmetromanila',
  'mandaluyong': 'nationalcapitalregionmetromanila',
  'mandaluyongcity': 'nationalcapitalregionmetromanila',
  'manila': 'nationalcapitalregionmetromanila',
  'cityofmanila': 'nationalcapitalregionmetromanila',
  'marikina': 'nationalcapitalregionmetromanila',
  'marikinacity': 'nationalcapitalregionmetromanila',
  'muntinlupa': 'nationalcapitalregionmetromanila',
  'muntinlupacity': 'nationalcapitalregionmetromanila',
  'navotas': 'nationalcapitalregionmetromanila',
  'navotascity': 'nationalcapitalregionmetromanila',
  'paraaque': 'nationalcapitalregionmetromanila',
  'paraaquecity': 'nationalcapitalregionmetromanila',
  'pasay': 'nationalcapitalregionmetromanila',
  'pasaycity': 'nationalcapitalregionmetromanila',
  'pasig': 'nationalcapitalregionmetromanila',
  'pasigcity': 'nationalcapitalregionmetromanila',
  'pateros': 'nationalcapitalregionmetromanila',
  'quezoncity': 'nationalcapitalregionmetromanila',
  'sanjuan': 'nationalcapitalregionmetromanila',
  'sanjuancity': 'nationalcapitalregionmetromanila',
  'taguig': 'nationalcapitalregionmetromanila',
  'taguigcity': 'nationalcapitalregionmetromanila',
  'valenzuela': 'nationalcapitalregionmetromanila',
  'valenzuelacity': 'nationalcapitalregionmetromanila',
  'metro manila': 'nationalcapitalregionmetromanila',
  'metromanila': 'nationalcapitalregionmetromanila',
  'ncr': 'nationalcapitalregionmetromanila',
  // Region aliases
  'car': 'cordilleraadministrative',
  'cordilleraadministrativeregion': 'cordilleraadministrative',
  'armm': 'autonomousregioninmuslimmindanao',
  'autonomousregioninmuslimmindanao': 'autonomousregioninmuslimmindanao',
  'barmm': 'autonomousregioninmuslimmindanao',
  'bangsamoroautonomousregioninmuslimmindanao': 'autonomousregioninmuslimmindanao',
  'caraga': 'caraga',
  'regioni': 'ilocos',
  'regionii': 'cagayanvalley',
  'regioniii': 'centralluzon',
  'regioniv': 'calabarzon',
  'regionv': 'bicol',
  'regionvi': 'westernvisayas',
  'regionvii': 'centralvisayas',
  'regionviii': 'easternvisayas',
  'regionix': 'zamboangapeninsula',
  'regionx': 'northernmindanao',
  'regionxi': 'davao',
  'regionxii': 'soccsksargen',
  'regionxiii': 'caraga',
  // Renamed / alternate names
  'compostelavalley': 'davaodeoro',
};

export function getCoordinates(input: string): PhLocation | null {
  if (!input) return null;
  const variants = keyVariants(input);

  // 1. Exact alias match (using any variant)
  for (const key of variants) {
    const aliasKey = PH_LOCATION_ALIASES[key];
    if (aliasKey && PH_LOCATION_MAP[aliasKey]) {
      const loc = PH_LOCATION_MAP[aliasKey];
      // Preserve the original input as the display label for NCR cities
      return { ...loc, name: aliasKey === 'nationalcapitalregionmetromanila' ? input : loc.name };
    }
  }

  // 2. Exact key match (using any variant)
  for (const key of variants) {
    if (PH_LOCATION_MAP[key]) return PH_LOCATION_MAP[key];
  }

  // 3. Substring fallback, but prefer longer matches to avoid false positives
  let best: PhLocation | null = null;
  let bestLen = 0;
  for (const key of variants) {
    for (const [k, loc] of Object.entries(PH_LOCATION_MAP)) {
      if (k.includes(key) || key.includes(k)) {
        const len = Math.max(k.length, key.length);
        if (!best || len > bestLen) {
          best = loc;
          bestLen = len;
        }
      }
    }
  }
  return best;
}
