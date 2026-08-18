import { apiClient, isMockMode } from './client';
import { mockDb } from './mockDb';
import { Exercise } from '../types';
import { delay } from './utils';

export interface PaginatedExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 100;
/** Stops a broken `total` from turning the catalogue fetch into an endless loop. */
const MAX_PAGES = 20;

/** Matches the server's `Difficulty` enum, easiest first. */
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
const DIFFICULTY_LADDER: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export const exercisesApi = {
  /** One server-side page; use for search-as-you-type against a large catalogue. */
  getPage: async (params: {
    search?: string;
    category?: string;
    /** Inclusive: "Intermediate" also returns beginner movements. */
    maxDifficulty?: Difficulty;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedExercisesResponse> => {
    if (isMockMode) {
      await delay(300);
      const all = mockDb.getExercises();
      const search = params.search?.toLowerCase();
      const allowed = params.maxDifficulty
        ? DIFFICULTY_LADDER.slice(0, DIFFICULTY_LADDER.indexOf(params.maxDifficulty) + 1)
        : null;
      const filtered = all.filter(
        (e) =>
          (!search || e.name.toLowerCase().includes(search)) &&
          (!params.category || e.category === params.category) &&
          (!allowed || allowed.includes((e.difficulty as Difficulty) ?? 'Beginner'))
      );
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? PAGE_SIZE;
      return {
        data: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    }

    const res = await apiClient.get<PaginatedExercisesResponse>('/exercises', {
      params: {
        search: params.search,
        category: params.category,
        maxDifficulty: params.maxDifficulty,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? PAGE_SIZE,
      },
    });
    return res.data;
  },

  /**
   * The filter chips on design 05. Kept separate from the result page so the
   * chip row shows every category in the catalogue, not just the ones that
   * happen to appear in the loaded page.
   */
  getCategories: async (): Promise<string[]> => {
    if (isMockMode) {
      await delay(150);
      return Array.from(
        new Set(mockDb.getExercises().map((e) => e.category).filter(Boolean) as string[])
      ).sort();
    }
    const res = await apiClient.get<string[]>('/exercises/categories');
    return res.data;
  },

  /**
   * The whole catalogue. The picker screens need every row in memory to group by
   * muscle, so this walks the pages instead of asking for one oversized page and
   * silently truncating once the catalogue outgrows it.
   */
  getAll: async (): Promise<Exercise[]> => {
    if (isMockMode) {
      await delay(300);
      return mockDb.getExercises();
    }

    const first = await exercisesApi.getPage({ page: 1 });
    const items = [...first.data];
    const totalPages = Math.min(
      MAX_PAGES,
      Math.ceil(first.total / (first.pageSize || PAGE_SIZE))
    );

    for (let page = 2; page <= totalPages; page += 1) {
      const next = await exercisesApi.getPage({ page });
      if (next.data.length === 0) break;
      items.push(...next.data);
    }

    return items;
  },

  /** Single exercise by id — used by the detail screen. */
  getById: async (id: number): Promise<Exercise> => {
    if (isMockMode) {
      await delay(150);
      const exercise = mockDb.getExercises().find((e) => e.id === id);
      if (!exercise) throw new Error(`Exercise ${id} not found`);
      return exercise as Exercise;
    }
    const res = await apiClient.get<Exercise>(`/exercises/${id}`);
    return res.data;
  },
};
