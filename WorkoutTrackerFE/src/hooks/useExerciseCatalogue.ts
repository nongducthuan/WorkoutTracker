import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { exercisesApi, Difficulty } from '../api/exercises';
import { Exercise } from '../types';
import { queryKeys } from './queryKeys';

/** Enough to fill a phone screen several times over without a second request. */
const PAGE_SIZE = 30;

/** Long enough to skip the intermediate letters of a typed word. */
const SEARCH_DEBOUNCE_MS = 300;

export const useDebounced = <T,>(value: T, delayMs = SEARCH_DEBOUNCE_MS): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

/** Every category in the catalogue, for the filter chips on design 05. */
export const useExerciseCategories = () => {
  const query = useQuery({
    queryKey: queryKeys.exerciseCategories,
    queryFn: exercisesApi.getCategories,
    // The seeded catalogue changes about never; do not refetch it per visit.
    staleTime: 30 * 60_000,
  });

  return { categories: query.data ?? [], isLoading: query.isLoading };
};

/**
 * The catalogue screen's list. Name and category are both applied by the
 * database, so the device downloads the rows it shows rather than the whole
 * catalogue — 18 exercises hides the difference, a real catalogue would not.
 *
 * Pages are appended on demand instead of on scroll: the screen is one long
 * `ScrollView` with a body diagram above the list, and hanging pagination off
 * its scroll position would fight the diagram for the gesture.
 */
export const useExerciseCatalogue = (
  search: string,
  category: string | null,
  maxDifficulty: Difficulty | null = null
) => {
  const debouncedSearch = useDebounced(search.trim());

  const query = useInfiniteQuery({
    queryKey: queryKeys.exerciseSearch(debouncedSearch, category, maxDifficulty),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      exercisesApi.getPage({
        search: debouncedSearch || undefined,
        category: category ?? undefined,
        maxDifficulty: maxDifficulty ?? undefined,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.data.length, 0);
      // A page that comes back short means the end, whatever `total` claims.
      if (last.data.length === 0 || loaded >= last.total) return undefined;
      return last.page + 1;
    },
  });

  const exercises = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.data) as Exercise[],
    [query.data]
  );

  return {
    exercises,
    total: query.data?.pages[0]?.total ?? 0,
    /** True while the *first* page of a new filter loads, not while appending. */
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    /** The typed text has not reached the server yet. */
    isDebouncing: search.trim() !== debouncedSearch,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
};
