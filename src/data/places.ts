import { Country, State, City } from 'country-state-city';
import type { Place } from '../types';
import { countryToContinent } from './continentMap';

const CITIES_PER_COUNTRY = 3;
const STATES_PER_COUNTRY = 2;
const MAX_PLACES = 800;

let placesCache: Place[] | null = null;

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function toPlace(
  type: Place['type'],
  name: string,
  opts: {
    id: string;
    countryCode?: string;
    stateCode?: string;
    parentName?: string;
    continent?: string;
    latitude?: number;
    longitude?: number;
    currency?: string;
    phonecode?: string;
    timezone?: string;
  }
): Place {
  return {
    id: opts.id,
    type,
    name,
    countryCode: opts.countryCode,
    stateCode: opts.stateCode,
    parentName: opts.parentName,
    continent: opts.continent,
    latitude: opts.latitude,
    longitude: opts.longitude,
    currency: opts.currency,
    phonecode: opts.phonecode,
    timezone: opts.timezone,
  };
}

export function buildPlacesList(): Place[] {
  if (placesCache) return placesCache;

  const places: Place[] = [];
  const countries = Country.getAllCountries();

  for (const c of countries) {
    const continent = countryToContinent[c.isoCode] ?? 'Unknown';
    const lat = parseFloat(c.latitude);
    const lon = parseFloat(c.longitude);

    places.push(
      toPlace('country', c.name, {
        id: `country-${c.isoCode}`,
        countryCode: c.isoCode,
        parentName: continent,
        continent,
        latitude: isNaN(lat) ? undefined : lat,
        longitude: isNaN(lon) ? undefined : lon,
        currency: c.currency || undefined,
        phonecode: c.phonecode || undefined,
        timezone: c.timezones?.[0]?.zoneName,
      })
    );

    if (places.length >= MAX_PLACES) break;

    const states = State.getStatesOfCountry(c.isoCode);
    const stateSample = states.slice(0, STATES_PER_COUNTRY);

    for (const s of stateSample) {
      const stateLat = s.latitude ? parseFloat(s.latitude) : NaN;
      const stateLon = s.longitude ? parseFloat(s.longitude) : NaN;

      places.push(
        toPlace('state', s.name, {
          id: `state-${c.isoCode}-${s.isoCode}`,
          countryCode: c.isoCode,
          stateCode: s.isoCode,
          parentName: c.name,
          continent,
          latitude: isNaN(stateLat) ? undefined : stateLat,
          longitude: isNaN(stateLon) ? undefined : stateLon,
          currency: c.currency || undefined,
          phonecode: c.phonecode || undefined,
        })
      );

      if (places.length >= MAX_PLACES) break;

      const cities = City.getCitiesOfState(c.isoCode, s.isoCode);
      const citySample = cities.slice(0, CITIES_PER_COUNTRY);

      for (const city of citySample) {
        const cityLat = city.latitude ? parseFloat(city.latitude) : NaN;
        const cityLon = city.longitude ? parseFloat(city.longitude) : NaN;

        places.push(
          toPlace('city', city.name, {
            id: `city-${c.isoCode}-${s.isoCode}-${city.name}`,
            countryCode: c.isoCode,
            stateCode: s.isoCode,
            parentName: s.name,
            continent,
            latitude: isNaN(cityLat) ? undefined : cityLat,
            longitude: isNaN(cityLon) ? undefined : cityLon,
          })
        );

        if (places.length >= MAX_PLACES) break;
      }
    }
  }

  placesCache = places;
  return places;
}

export function getDailyPlace(date: Date): Place {
  const places = buildPlacesList();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const index = simpleHash(dateStr) % places.length;
  return places[index];
}
