import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';
import { ReportStats } from '../types';
import { queryKeys } from './queryKeys';

export const useReports = () => {
  const query = useQuery({
    queryKey: queryKeys.reports,
    queryFn: reportsApi.getStats,
  });

  return {
    stats: query.data as ReportStats | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
