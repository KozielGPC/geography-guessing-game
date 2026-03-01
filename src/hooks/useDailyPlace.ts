import { useMemo } from 'react';
import { getDailyPlace } from '../data/places';
import type { Place } from '../types';

export function useDailyPlace(date: Date = new Date()): Place {
  const dateKey = date.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dateKey uniquely identifies the calendar date
  return useMemo(() => getDailyPlace(date), [dateKey]);
}
