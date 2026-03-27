import { useCallback, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { sampleSeedRatings } from '@/mocks/data';
import { MealRating } from '@/types';

interface RatedItemSummary {
  name: string;
  average: number;
  count: number;
}

interface RatingsStoreValue {
  ratings: MealRating[];
  ratedPeriods: Set<string>;
  submitRating: (rating: MealRating) => void;
  averageRating: (menuItemID: string) => number | null;
  ratingsCount: (menuItemID: string) => number;
  allRatedItems: () => RatedItemSummary[];
  markPeriodRated: (key: string) => void;
}

export const [RatingsStoreProvider, useRatingsStore] = createContextHook<RatingsStoreValue>(() => {
  const [ratings, setRatings] = useState<MealRating[]>(sampleSeedRatings);
  const [ratedPeriods, setRatedPeriods] = useState<Set<string>>(new Set<string>());

  const submitRating = useCallback((rating: MealRating) => {
    console.log('[RatingsStore] Submitting rating:', rating.menuItemName, 'stars:', rating.stars, 'period:', rating.mealPeriod);
    setRatings((prev) => [...prev, rating]);
  }, []);

  const averageRating = useCallback((menuItemID: string) => {
    const filtered = ratings.filter((rating) => rating.menuItemID === menuItemID);
    if (filtered.length === 0) {
      return null;
    }
    const total = filtered.reduce((sum, rating) => sum + rating.stars, 0);
    return total / filtered.length;
  }, [ratings]);

  const ratingsCount = useCallback((menuItemID: string) => ratings.filter((rating) => rating.menuItemID === menuItemID).length, [ratings]);

  const allRatedItems = useCallback((): RatedItemSummary[] => {
    const grouped = new Map<string, { name: string; total: number; count: number }>();

    ratings.forEach((rating) => {
      const existing = grouped.get(rating.menuItemID);
      if (existing) {
        existing.total += rating.stars;
        existing.count += 1;
        return;
      }

      grouped.set(rating.menuItemID, {
        name: rating.menuItemName,
        total: rating.stars,
        count: 1,
      });
    });

    return Array.from(grouped.values())
      .map((item) => ({
        name: item.name,
        average: item.total / item.count,
        count: item.count,
      }))
      .sort((a, b) => b.average - a.average || b.count - a.count || a.name.localeCompare(b.name));
  }, [ratings]);

  const markPeriodRated = useCallback((key: string) => {
    console.log('[RatingsStore] Marking period as handled:', key);
    setRatedPeriods((prev) => new Set<string>([...prev, key]));
  }, []);

  return useMemo<RatingsStoreValue>(() => ({
    ratings,
    ratedPeriods,
    submitRating,
    averageRating,
    ratingsCount,
    allRatedItems,
    markPeriodRated,
  }), [allRatedItems, averageRating, markPeriodRated, ratedPeriods, ratings, ratingsCount, submitRating]);
});
