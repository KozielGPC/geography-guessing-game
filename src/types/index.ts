export type PlaceType = 'continent' | 'country' | 'state' | 'city';

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
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

export interface Hint {
  category: 'geographical' | 'cultural' | 'socioeconomic';
  text: string;
}

export interface MapSelection {
  continent?: string;
  country?: string;
  state?: string;
  city?: string;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  place: Place | null;
  hintsRevealed: number;
  guess: MapSelection | null;
  status: GameStatus;
  isLoading: boolean;
  error: string | null;
}
