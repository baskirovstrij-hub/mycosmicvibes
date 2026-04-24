import interpretations from '../assets/interpretations_seed.json';

export async function getInterpretationByKey(key: string) {
  const interpretation = interpretations.find((item: any) => item.key === key);
  
  if (interpretation) {
    return {
      category: interpretation.category,
      content: interpretation.content,
      detailedContent: interpretation.detailedContent,
      key: interpretation.key
    };
  }
  return null;
}

export async function mapNatalDataToInterpretations(natalData: any) {
  const results: { category: string; key: string; content: string; detailedContent?: string }[] = [];

  // Helper to add all matching interpretations
  const addInterpretations = (key: string) => {
    const matches = interpretations.filter((item: any) => item.key === key);
    matches.forEach(match => results.push(match));
  };

  // 1. Planets in Signs
  for (const planet of natalData.planets) {
    addInterpretations(`${planet.name}_${planet.sign}`);
  }

  // 1.1 Points in Signs (Asc, Desc, MC, IC)
  if (natalData.points) {
    for (const point of natalData.points) {
      addInterpretations(`${point.name}_${point.sign}`);
    }
  }

  // 2. Planets in Houses
  for (const planet of natalData.planets) {
    const houseNumber = findHouseForPlanet(planet.longitude, natalData.houses);
    addInterpretations(`${planet.name}_House_${houseNumber}`);
  }

  // 3. Aspects
  if (natalData.aspects) {
    for (const aspect of natalData.aspects) {
      addInterpretations(`${aspect.point1}_${aspect.point2}_${aspect.type}`);
    }
  }

  // 4. Houses in Signs
  if (natalData.houses) {
    for (const house of natalData.houses) {
      addInterpretations(`House_${house.number}_${house.sign}`);
    }
  }

  return results;
}

function findHouseForPlanet(planetLong: number, houses: any[]) {
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    let isInside = false;
    if (currentHouse.longitude < nextHouse.longitude) {
      isInside = planetLong >= currentHouse.longitude && planetLong < nextHouse.longitude;
    } else {
      // House spans across 0°
      isInside = planetLong >= currentHouse.longitude || planetLong < nextHouse.longitude;
    }
    
    if (isInside) return currentHouse.number;
  }
  return 1;
}
