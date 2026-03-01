import type { Place, Hint } from '../types';

function formatCoord(n: number): string {
  const abs = Math.abs(n);
  const deg = Math.floor(abs);
  const dir = Math.abs(n) <= 90 ? (n >= 0 ? 'N' : 'S') : (n >= 0 ? 'E' : 'W');
  return `${deg}°${dir}`;
}

export function getHintsForPlace(place: Place): Hint[] {
  const hints: Hint[] = [];

  if (place.continent) {
    hints.push({
      category: 'geographical',
      text: `This place is located in ${place.continent}.`,
    });
  }

  if (place.latitude != null && place.longitude != null) {
    const latStr = formatCoord(place.latitude);
    const lonStr = formatCoord(place.longitude);
    const hemisphere = place.latitude >= 0 ? 'Northern' : 'Southern';
    hints.push({
      category: 'geographical',
      text: `It lies in the ${hemisphere} hemisphere, approximately at ${latStr}, ${lonStr}.`,
    });
  }

  if (place.currency) {
    hints.push({
      category: 'cultural',
      text: `The local currency is ${place.currency}.`,
    });
  }

  if (place.phonecode) {
    hints.push({
      category: 'socioeconomic',
      text: `The country phone code is +${place.phonecode}.`,
    });
  }

  if (place.countryCode) {
    hints.push({
      category: 'socioeconomic',
      text: `The country ISO code is ${place.countryCode.toUpperCase()}.`,
    });
  }

  if (place.timezone) {
    hints.push({
      category: 'cultural',
      text: `A common timezone is ${place.timezone}.`,
    });
  }

  if (place.type === 'state' && place.parentName) {
    hints.push({
      category: 'geographical',
      text: `It is a state or region within ${place.parentName}.`,
    });
  }

  if (place.type === 'city' && place.parentName) {
    hints.push({
      category: 'geographical',
      text: `It is a city in ${place.parentName}.`,
    });
  }

  return hints.slice(0, 5);
}
