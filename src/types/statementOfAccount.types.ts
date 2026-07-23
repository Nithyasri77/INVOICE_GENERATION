/**
 * Purpose: TypeScript types for the Statement of Account module (BRD: Billing > Statement of
 *          Account — complete invoice/payment history and outstanding balance)
 * Responsibilities: Single source of truth for the ledger entry shape, the query params
 *                    (Client, Project OR All Projects, Date From/To — per the locked wireframe),
 *                    and the generated statement result — services/features/pages all import
 *                    from here
 * Dependencies: none
 * Export: LedgerDocumentType, LedgerEntry, StatementOfAccountParams, StatementOfAccount
 */

export type LedgerDocumentType = 'Invoice' | 'Receipt' | 'Credit Note' | 'Debit Note';

export interface LedgerEntry {
  id: string;
  date: string; // ISO date
  documentType: LedgerDocumentType;
  documentNo: string;
  particulars: string;
  /** Set on "All Projects" statements so each row can show which project it belongs to */
  projectName?: string;
  debit: number;
  credit: number;
  /** Running balance as of this entry, computed across the client/project's full ledger history */
  balance: number;
  isOpeningBalance?: boolean;
}

export interface StatementOfAccountParams {
  clientId: string;
  /** Omit (or 'all') for a client-wide statement across every project */
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StatementOfAccount {
  client: { id: string; companyName: string };
  /** Present only when the statement is scoped to a single project */
  project?: { id: string; projectName: string; projectValue: number };
  projectValue: number;
  entries: LedgerEntry[];
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  outstandingBalance: number;
  generatedAt: string; // ISO datetime
}
