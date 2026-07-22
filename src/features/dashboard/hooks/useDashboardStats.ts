/**
 * Purpose: Data-fetching hook for the Dashboard page
 * Responsibilities: Wrap dashboardService calls in useQuery (caching, loading/error states);
 *                    this is the only thing DashboardPage imports from the data layer
 * Dependencies: @tanstack/react-query, dashboardService
 * Export: useDashboardStats, useRevenueOverview, useOutstandingTrend
 */
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRevenueOverview, getOutstandingTrend } from '../../../services/dashboardService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
}

export function useRevenueOverview() {
  return useQuery({
    queryKey: ['dashboard', 'revenue-overview'],
    queryFn: getRevenueOverview,
  });
}

export function useOutstandingTrend() {
  return useQuery({
    queryKey: ['dashboard', 'outstanding-trend'],
    queryFn: getOutstandingTrend,
  });
}
