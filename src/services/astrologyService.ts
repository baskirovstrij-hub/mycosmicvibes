import SwissEPH from 'sweph-wasm';

let swe: any = null;

async function getSwe() {
  if (!swe) {
    // Using CDN URL to ensure the WASM file is served correctly with proper MIME types and no corruption
    const wasmUrl = 'https://unpkg.com/sweph-wasm@2.6.9/dist/wasm/swisseph.wasm';
    swe = await SwissEPH.init(wasmUrl);
  }
  return swe;
}

export async function calculateNatalData(dateStr: string, timeStr: string, lat: number, lng: number) {
  const sw = await getSwe();
  
  // Parse date and time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  
  // Calculate Julian Day
  const jd_ut = sw.swe_julday(year, month, day, hour + minute / 60, sw.SE_GREG_CAL);
  
  // 10 Planets
  const planetIds = [
    sw.SE_SUN, sw.SE_MOON, sw.SE_MERCURY, sw.SE_VENUS, sw.SE_MARS,
    sw.SE_JUPITER, sw.SE_SATURN, sw.SE_URANUS, sw.SE_NEPTUNE, sw.SE_PLUTO
  ];
  
  const planetNames = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
  ];
  
  const planets = planetIds.map((id, index) => {
    const res = sw.swe_calc_ut(jd_ut, id, sw.SEFLG_SWIEPH);
    const longitude = res[0];
    const speed = res[3];
    return {
      name: planetNames[index],
      longitude,
      sign: getZodiacSign(longitude),
      degree: Math.floor(longitude % 30),
      house: 0,
      isRetrograde: speed < 0
    };
  });
  
  // 12 Houses (Placidus)
  const houseRes = sw.swe_houses(jd_ut, lat, lng, 'P');
  const houses = houseRes.cusps.slice(1, 13).map((long: number, index: number) => ({
    number: index + 1,
    longitude: long,
    sign: getZodiacSign(long),
    degree: Math.floor(long % 30)
  }));

  // Update planets with house numbers
  const houseCusps = houseRes.cusps.slice(1, 13);
  planets.forEach(p => {
    p.house = findHouse(p.longitude, houseCusps);
  });

  const ascendantLong = houseRes.ascmc[0];
  const mcLong = houseRes.ascmc[2];
  const descendantLong = (ascendantLong + 180) % 360;
  const icLong = (mcLong + 180) % 360;

  const points = [
    { name: 'Ascendant', longitude: ascendantLong, sign: getZodiacSign(ascendantLong), degree: Math.floor(ascendantLong % 30) },
    { name: 'Descendant', longitude: descendantLong, sign: getZodiacSign(descendantLong), degree: Math.floor(descendantLong % 30) },
    { name: 'MC', longitude: mcLong, sign: getZodiacSign(mcLong), degree: Math.floor(mcLong % 30) },
    { name: 'IC', longitude: icLong, sign: getZodiacSign(icLong), degree: Math.floor(icLong % 30) }
  ];
  
  // Aspects (Orbis 5°)
  const aspects = [];
  const majorAspects = [
    { name: 'Conjunction', angle: 0 },
    { name: 'Opposition', angle: 180 },
    { name: 'Trine', angle: 120 },
    { name: 'Square', angle: 90 },
    { name: 'Sextile', angle: 60 }
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      for (const aspect of majorAspects) {
        const orb = Math.abs(angle - aspect.angle);
        if (orb <= 5) {
          aspects.push({
            point1: p1.name,
            point2: p2.name,
            type: aspect.name,
            orb: parseFloat(orb.toFixed(2))
          });
        }
      }
    }
  }
  
  return {
    planets,
    houses,
    points,
    aspects
  };
}

function findHouse(planetLong: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const current = cusps[i];
    const next = cusps[(i + 1) % 12];
    
    if (current < next) {
      if (planetLong >= current && planetLong < next) return i + 1;
    } else {
      if (planetLong >= current || planetLong < next) return i + 1;
    }
  }
  return 1;
}

export async function calculateTransitMoon(date: Date) {
  const sw = await getSwe();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

  const jd_ut = sw.swe_julday(year, month, day, hour, sw.SE_GREG_CAL);
  const res = sw.swe_calc_ut(jd_ut, sw.SE_MOON, sw.SEFLG_SWIEPH);
  const longitude = res[0];

  return {
    name: 'Moon',
    longitude,
    sign: getZodiacSign(longitude),
    degree: Math.floor(longitude % 30)
  };
}

function getZodiacSign(longitude: number) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[Math.floor(longitude / 30)];
}
