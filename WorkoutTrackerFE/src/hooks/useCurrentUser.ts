import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

export interface CurrentUser {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  /** `YYYY-MM-DD` */
  birthday?: string | null;
}

/**
 * Single accessor for the cached user profile.
 *
 * Screens used to read `currentUser.name`, a field the API never returns, so
 * the dashboard permanently greeted everyone as "Athlete". Going through this
 * hook keeps the field names honest in one place.
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Render the cached profile first so the screen never flashes empty, then
      // reconcile with the server, which is the source of truth for the body
      // metrics edited on 08b.
      const stored = await authApi.getCurrentUser();
      setUser(stored ?? null);

      if (await authApi.isAuthenticated()) {
        try {
          setUser(await authApi.fetchCurrentUser());
        } catch {
          // offline — the cached copy stands
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    user,
    /** Display name with a safe fallback for the greeting. */
    displayName: user?.fullName || user?.userName || '',
    isLoading,
    reload: load,
  };
};
