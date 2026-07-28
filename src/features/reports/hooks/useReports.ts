/**
 * Purpose: Data-fetching hooks for the Reports module
 * Responsibilities: Wrap reportService's aggregation functions in useQuery (caching, loading/
 *                    error states) — read only, reports have no create/update/delete
 * Dependencies: @tanstack/react-query, reportService
 * Export: useRevenueSummary, useOutstandingReport, useClientRevenueReport,
 *          useProjectRevenueReport, useOverduePaymentsReport, useMonthlyCollectionsReport,
 *          useAmcRevenueReport
 */
import { useQuery } from '@tanstack/react-query';
import {
  getRevenueSummary,
  getOutstandingReport,
  getClientRevenueReport,
  getProjectRevenueReport,
  getOverduePaymentsReport,
  getMonthlyCollectionsReport,
  getAmcRevenueReport,
} from '../../../services/reportService';

const REPORTS_KEY = 'reports';

export function useRevenueSummary() {
  return useQuery({ queryKey: [REPORTS_KEY, 'revenue-summary'], queryFn: getRevenueSummary });
}

export function useOutstandingReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'outstanding'], queryFn: getOutstandingReport });
}

export function useClientRevenueReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'client-revenue'], queryFn: getClientRevenueReport });
}

export function useProjectRevenueReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'project-revenue'], queryFn: getProjectRevenueReport });
}

export function useOverduePaymentsReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'overdue-payments'], queryFn: getOverduePaymentsReport });
}

export function useMonthlyCollectionsReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'monthly-collections'], queryFn: getMonthlyCollectionsReport });
}

export function useAmcRevenueReport() {
  return useQuery({ queryKey: [REPORTS_KEY, 'amc-revenue'], queryFn: getAmcRevenueReport });
}
