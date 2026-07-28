/**
 * Purpose: Aggregation layer for the Reports module (BRD: Outstanding/Revenue/Client-wise/
 *          Project-wise/AMC Revenue/Overdue Payments/Monthly Collections)
 * Responsibilities: Derive every report live from Invoices + Payments so Reports always reflects
 *                    the current state of those modules — no separate seed dataset to drift out
 *                    of sync. AMC Revenue has no source module yet (AMC Contracts is a Future
 *                    Module per BRD), so getAmcRevenue returns an empty result by design.
 * NOTE: No Reports API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently computes from the in-memory Invoice/Payment seed data.
 *       Swap the TODO block for the real call once the backend is live.
 * Dependencies: invoiceService, paymentService, report.types
 * Export: getRevenueSummary, getOutstandingReport, getClientRevenueReport,
 *          getProjectRevenueReport, getOverduePaymentsReport, getMonthlyCollectionsReport,
 *          getAmcRevenueReport
 */
import { getAllInvoices } from './invoiceService';
import { getAllPayments } from './paymentService';
import type {
  ClientRevenueRow,
  MonthlyCollectionRow,
  OutstandingRow,
  OverdueRow,
  ProjectRevenueRow,
  RevenueSummary,
} from '../types/report.types';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function collectedByInvoiceId(): Promise<Map<string, number>> {
  const payments = await getAllPayments();
  const map = new Map<string, number>();
  for (const p of payments) {
    map.set(p.invoiceId, (map.get(p.invoiceId) ?? 0) + p.amount);
  }
  return map;
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  // TODO: replace with `const { data } = await axiosClient.get<RevenueSummary>('/reports/revenue'); return data;`
  const invoices = await getAllInvoices();
  const collectedMap = await collectedByInvoiceId();

  let totalInvoiced = 0;
  let totalCollected = 0;
  for (const inv of invoices) {
    const invoiceTotal = inv.amount + inv.gst;
    totalInvoiced += invoiceTotal;
    totalCollected += collectedMap.get(inv.id) ?? 0;
  }

  return delay({
    totalInvoiced,
    totalCollected,
    totalOutstanding: totalInvoiced - totalCollected,
    invoiceCount: invoices.length,
  });
}

export async function getOutstandingReport(): Promise<OutstandingRow[]> {
  // TODO: replace with `const { data } = await axiosClient.get<OutstandingRow[]>('/reports/outstanding'); return data;`
  const invoices = await getAllInvoices();
  const collectedMap = await collectedByInvoiceId();

  return delay(
    invoices
      .map((inv) => {
        const invoiceAmount = inv.amount + inv.gst;
        const collected = collectedMap.get(inv.id) ?? 0;
        return {
          invoiceNo: inv.invoiceNo,
          projectName: inv.projectName,
          clientName: inv.clientName,
          invoiceAmount,
          collected,
          outstanding: invoiceAmount - collected,
          dueDate: inv.dueDate,
        };
      })
      .filter((row) => row.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding)
  );
}

export async function getClientRevenueReport(): Promise<ClientRevenueRow[]> {
  // TODO: replace with `const { data } = await axiosClient.get<ClientRevenueRow[]>('/reports/client-revenue'); return data;`
  const invoices = await getAllInvoices();
  const collectedMap = await collectedByInvoiceId();

  const byClient = new Map<string, { invoiced: number; collected: number; projects: Set<string> }>();
  for (const inv of invoices) {
    const entry = byClient.get(inv.clientName) ?? { invoiced: 0, collected: 0, projects: new Set<string>() };
    entry.invoiced += inv.amount + inv.gst;
    entry.collected += collectedMap.get(inv.id) ?? 0;
    entry.projects.add(inv.projectId);
    byClient.set(inv.clientName, entry);
  }

  return delay(
    Array.from(byClient.entries())
      .map(([clientName, v]) => ({
        clientName,
        invoiced: v.invoiced,
        collected: v.collected,
        outstanding: v.invoiced - v.collected,
        projectCount: v.projects.size,
      }))
      .sort((a, b) => b.invoiced - a.invoiced)
  );
}

export async function getProjectRevenueReport(): Promise<ProjectRevenueRow[]> {
  // TODO: replace with `const { data } = await axiosClient.get<ProjectRevenueRow[]>('/reports/project-revenue'); return data;`
  const invoices = await getAllInvoices();
  const collectedMap = await collectedByInvoiceId();

  const byProject = new Map<string, { projectName: string; clientName: string; invoiced: number; collected: number }>();
  for (const inv of invoices) {
    const entry = byProject.get(inv.projectId) ?? {
      projectName: inv.projectName,
      clientName: inv.clientName,
      invoiced: 0,
      collected: 0,
    };
    entry.invoiced += inv.amount + inv.gst;
    entry.collected += collectedMap.get(inv.id) ?? 0;
    byProject.set(inv.projectId, entry);
  }

  return delay(
    Array.from(byProject.values())
      .map((v) => ({ ...v, outstanding: v.invoiced - v.collected }))
      .sort((a, b) => b.invoiced - a.invoiced)
  );
}

export async function getOverduePaymentsReport(): Promise<OverdueRow[]> {
  // TODO: replace with `const { data } = await axiosClient.get<OverdueRow[]>('/reports/overdue-payments'); return data;`
  const invoices = await getAllInvoices();
  const collectedMap = await collectedByInvoiceId();
  const today = new Date();

  return delay(
    invoices
      .filter((inv) => inv.status === 'Overdue')
      .map((inv) => {
        const invoiceAmount = inv.amount + inv.gst;
        const collected = collectedMap.get(inv.id) ?? 0;
        const daysOverdue = Math.max(
          0,
          Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          invoiceNo: inv.invoiceNo,
          projectName: inv.projectName,
          clientName: inv.clientName,
          amountDue: invoiceAmount - collected,
          dueDate: inv.dueDate,
          daysOverdue,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  );
}

export async function getMonthlyCollectionsReport(): Promise<MonthlyCollectionRow[]> {
  // TODO: replace with `const { data } = await axiosClient.get<MonthlyCollectionRow[]>('/reports/monthly-collections'); return data;`
  const payments = await getAllPayments();
  const byMonth = new Map<string, number>();

  for (const p of payments) {
    const month = p.paymentDate.slice(0, 7); // "YYYY-MM"
    byMonth.set(month, (byMonth.get(month) ?? 0) + p.amount);
  }

  const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' });

  return delay(
    Array.from(byMonth.entries())
      .map(([month, collected]) => ({
        month,
        monthLabel: monthFormatter.format(new Date(`${month}-01`)),
        collected,
      }))
      .sort((a, b) => (a.month < b.month ? 1 : -1))
  );
}

/** AMC Contracts is a BRD Future Module — no source data exists yet, so this is intentionally empty. */
export async function getAmcRevenueReport(): Promise<[]> {
  // TODO: replace with `const { data } = await axiosClient.get<AmcRevenueRow[]>('/reports/amc-revenue'); return data;` once AMC Contracts is built
  return delay([]);
}
