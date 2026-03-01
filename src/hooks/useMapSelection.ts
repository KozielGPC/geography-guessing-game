import { useState, useCallback, useRef } from 'react';
import type { MapSelection } from '../types';
import { countryToContinent } from '../data/continentMap';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

interface NominatimAddress {
  continent?: string;
  country?: string;
  country_code?: string;
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function useMapSelection() {
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const resolvePlace = useCallback(async (lat: number, lon: number, zoom: number): Promise<MapSelection | null> => {
    const now = Date.now();
    const elapsed = now - lastRequestRef.current;
    if (elapsed < 1000) {
      await new Promise((r) => setTimeout(r, 1000 - elapsed));
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        format: 'json',
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        signal: abortRef.current.signal,
        headers: { 'Accept-Language': 'en' },
      });
      lastRequestRef.current = Date.now();

      if (!res.ok) throw new Error('Reverse geocoding failed');
      const data: NominatimResponse = await res.json();
      const addr = data.address;
      if (!addr) return null;

      const country = addr.country ?? undefined;
      const countryCode = addr.country_code?.toUpperCase();
      const continent = addr.continent ?? (countryCode ? countryToContinent[countryCode] : undefined);
      const state = addr.state ?? addr.county ?? undefined;
      const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? undefined;

      let result: MapSelection = {};

      if (zoom <= 2 && continent) {
        result = { continent };
      } else if (zoom <= 4 && country) {
        result = { continent, country };
      } else if (zoom <= 6 && (state || country)) {
        result = { continent, country, state };
      } else {
        result = { continent, country, state, city };
      }

      return result;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return null;
      throw e;
    }
  }, []);

  const handleMapClick = useCallback(
    async (lat: number, lon: number, zoom: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await resolvePlace(lat, lon, zoom);
        setSelection(result);
        return result;
      } catch (err) {
        setError((err as Error).message);
        setSelection(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [resolvePlace]
  );

  return { selection, isLoading, error, handleMapClick };
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function checkGuess(guess: MapSelection, answer: { type: string; name: string; countryCode?: string; parentName?: string; continent?: string }): boolean {
  switch (answer.type) {
    case 'continent':
      return !!guess.continent && fuzzyMatch(guess.continent, answer.name);
    case 'country':
      return !!guess.country && fuzzyMatch(guess.country, answer.name);
    case 'state':
      return !!guess.state && fuzzyMatch(guess.state, answer.name);
    case 'city':
      return !!guess.city && fuzzyMatch(guess.city, answer.name);
    default:
      return false;
  }
}
