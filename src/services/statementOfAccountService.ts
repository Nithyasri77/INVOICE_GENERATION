/**
 * Purpose: Data access layer for the Statement of Account module
 * Responsibilities: Expose getStatementOfAccount as the only way features/statement-of-account
 *                    reads this data — takes Client + (Project OR All Projects) + Date From/To,
 *                    returns the merged Invoice/Receipt ledger with a running balance, matching
 *                    the locked "Statement of Account Screen" wireframe (Choose → Display → Bottom
 *                    Outstanding)
 * NOTE: No Invoices/Payments API endpoint exists yet (those modules are still placeholders), so
 *       this reads an in-memory seed ledger keyed by projectId, cross-checked against each
 *       project's `projectValue`/`receivedTillDate` (projectService) so the numbers this page
 *       shows always agree with the Projects module. Swap the TODO block for the real call once
 *       Invoices/Payments are live.
 * Dependencies: axiosClient, statementOfAccount.types, clientService, projectService
 * Export: getStatementOfAccount
 */
import type { LedgerEntry, StatementOfAccount, StatementOfAccountParams } from '../types/statementOfAccount.types';
import { getClientById } from './clientService';
import { getProjectById, getProjects } from './projectService';

/** Seed ledger rows per projectId. Each project's Receipt rows sum to that project's
 *  `receivedTillDate` in projectService, so Statement of Account and the Project Detail
 *  Financial Summary always tie out. */
const SEED_LEDGER: Record<string, Omit<LedgerEntry, 'balance'>[]> = {
  '1': [
    { id: '1-1', date: '2025-02-05', documentType: 'Invoice', documentNo: 'INV-2025-1001', particulars: 'Advance Invoice — Project Kickoff', debit: 170000, credit: 0 },
    { id: '1-2', date: '2025-02-10', documentType: 'Receipt', documentNo: 'REC-2025-1001', particulars: 'Payment Received — Advance', debit: 0, credit: 170000 },
    { id: '1-3', date: '2025-05-20', documentType: 'Invoice', documentNo: 'INV-2025-1002', particulars: 'Milestone Invoice — Development', debit: 340000, credit: 0 },
    { id: '1-4', date: '2025-05-28', documentType: 'Receipt', documentNo: 'REC-2025-1002', particulars: 'Payment Received — Partial (Development)', debit: 0, credit: 255000 },
  ],
  '2': [
    { id: '2-1', date: '2025-03-15', documentType: 'Invoice', documentNo: 'INV-2025-2001', particulars: 'Advance Invoice — Project Kickoff', debit: 108000, credit: 0 },
    { id: '2-2', date: '2025-03-20', documentType: 'Receipt', documentNo: 'REC-2025-2001', particulars: 'Payment Received — Advance', debit: 0, credit: 108000 },
    { id: '2-3', date: '2025-04-25', documentType: 'Invoice', documentNo: 'INV-2025-2002', particulars: 'Milestone Invoice — UI Design Sign-off', debit: 90000, credit: 0 },
    { id: '2-4', date: '2025-04-30', documentType: 'Receipt', documentNo: 'REC-2025-2002', particulars: 'Payment Received — Partial (UI Design)', debit: 0, credit: 72000 },
  ],
  '3': [
    { id: '3-1', date: '2024-10-10', documentType: 'Invoice', documentNo: 'INV-2024-3001', particulars: 'Advance Invoice — Project Kickoff', debit: 96000, credit: 0 },
    { id: '3-2', date: '2024-10-15', documentType: 'Receipt', documentNo: 'REC-2024-3001', particulars: 'Payment Received — Advance', debit: 0, credit: 96000 },
    { id: '3-3', date: '2024-12-05', documentType: 'Invoice', documentNo: 'INV-2024-3002', particulars: 'Milestone Invoice — Fleet Mapping Module', debit: 50000, credit: 0 },
  ],
  '4': [
    { id: '4-1', date: '2025-01-20', documentType: 'Invoice', documentNo: 'INV-2025-4001', particulars: 'Advance Invoice — Project Kickoff', debit: 196000, credit: 0 },
    { id: '4-2', date: '2025-01-25', documentType: 'Receipt', documentNo: 'REC-2025-4001', particulars: 'Payment Received — Advance', debit: 0, credit: 196000 },
    { id: '4-3', date: '2025-03-28', documentType: 'Invoice', documentNo: 'INV-2025-4002', particulars: 'Milestone Invoice — Checkout Module', debit: 294000, credit: 0 },
    { id: '4-4', date: '2025-04-02', documentType: 'Receipt', documentNo: 'REC-2025-4002', particulars: 'Payment Received — Checkout Module', debit: 0, credit: 294000 },
    { id: '4-5', date: '2025-06-10', documentType: 'Invoice', documentNo: 'INV-2025-4003', particulars: 'Final Invoice — Go Live', debit: 150500, credit: 0 },
    { id: '4-6', date: '2025-06-15', documentType: 'Receipt', documentNo: 'REC-2025-4003', particulars: 'Payment Received — Final', debit: 0, credit: 150500 },
  ],
  '5': [
    { id: '5-1', date: '2025-06-05', documentType: 'Invoice', documentNo: 'INV-2025-5001', particulars: 'Advance Invoice — Project Kickoff', debit: 210000, credit: 0 },
    { id: '5-2', date: '2025-06-10', documentType: 'Receipt', documentNo: 'REC-2025-5001', particulars: 'Payment Received — Advance', debit: 0, credit: 210000 },
    { id: '5-3', date: '2025-07-20', documentType: 'Invoice', documentNo: 'INV-2025-5002', particulars: 'Milestone Invoice — Inventory Module', debit: 105000, credit: 0 },
  ],
};

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getStatementOfAccount(params: StatementOfAccountParams): Promise<StatementOfAccount> {
  // TODO: replace with `const { data } = await axiosClient.get<StatementOfAccount>('/billing/statement-of-account', { params }); return data;`
  const client = await getClientById(params.clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  const scopedProject = params.projectId && params.projectId !== 'all' ? await getProjectById(params.projectId) : undefined;

  const projects = scopedProject
    ? [scopedProject]
    : (await getProjects({ page: 1, pageSize: 100, clientId: params.clientId })).data;

  const projectValue = projects.reduce((sum, p) => sum + p.projectValue, 0);
  const showProjectName = projects.length > 1;

  // Merge every scoped project's ledger, tag rows with the project name for multi-project
  // statements, and sort chronologically (same-day rows keep their authored/seed order).
  const merged = projects
    .flatMap((p) =>
      (SEED_LEDGER[p.id] ?? []).map((row) => ({
        ...row,
        projectName: showProjectName ? p.projectName : undefined,
      }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  // Running balance across the FULL history first, so the Balance column stays a true
  // point-in-time balance even when the Date From/To filter below only shows a slice of rows.
  let runningBalance = 0;
  const withBalances: LedgerEntry[] = merged.map((row) => {
    runningBalance += row.debit - row.credit;
    return { ...row, balance: runningBalance };
  });

  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;

  const before = withBalances.filter((row) => dateFrom && row.date < dateFrom);
  const openingBalance = before.length > 0 ? before[before.length - 1].balance : 0;

  let visible = withBalances.filter(
    (row) => (!dateFrom || row.date >= dateFrom) && (!dateTo || row.date <= dateTo)
  );

  if (dateFrom && openingBalance !== 0) {
    visible = [
      {
        id: 'opening',
        date: dateFrom,
        documentType: 'Invoice',
        documentNo: '—',
        particulars: 'Opening Balance',
        debit: 0,
        credit: 0,
        balance: openingBalance,
        isOpeningBalance: true,
      },
      ...visible,
    ];
  }

  const totalDebit = visible.filter((r) => !r.isOpeningBalance).reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = visible.filter((r) => !r.isOpeningBalance).reduce((sum, r) => sum + r.credit, 0);
  const outstandingBalance = visible.length > 0 ? visible[visible.length - 1].balance : openingBalance;

  return delay({
    client: { id: client.id, companyName: client.companyName },
    project: scopedProject
      ? { id: scopedProject.id, projectName: scopedProject.projectName, projectValue: scopedProject.projectValue }
      : undefined,
    projectValue,
    entries: visible,
    openingBalance,
    totalDebit,
    totalCredit,
    outstandingBalance,
    generatedAt: new Date().toISOString(),
  });
}
