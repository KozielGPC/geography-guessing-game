# Geography Guessing Game

Website for guessing the state, city or country, changing the value to be guessed every day.

## Features

- **Daily rotation**: A new place to guess each day (deterministic, same for all users)
- **Progressive hints**: Reveal hints one by one (geographical, cultural, socioeconomic)
- **Zoom-based map selection**: Click on the map to guess; zoom level determines granularity:
  - Zoom 1–2: Continent
  - Zoom 3–4: Country
  - Zoom 5–6: State/region
  - Zoom 7+: City

## Tech Stack

- React 18 + Vite + TypeScript
- react-leaflet + Leaflet (OpenStreetMap)
- country-state-city (place data)
- Nominatim (reverse geocoding)

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Preview Mode

Add `?preview=1` to the URL to see today's place and hints (for testing).
