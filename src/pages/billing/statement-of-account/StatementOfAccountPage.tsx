/**
 * Purpose: Statement of Account module landing page (BRD: complete invoice/payment history and
 *          outstanding balance) — replaces the earlier PlaceholderPage stub now that this module
 *          is generated
 * Responsibilities: Compose the "Choose" filter panel (Client, Project OR All Projects, Date
 *                    From/To, Generate), the summary stat cards, the "Display" ledger table
 *                    (Date/Document/Particulars/Debit/Credit/Balance), and the "Bottom" Outstanding
 *                    callout — exactly matching the locked Statement of Account Screen wireframe.
 *                    This page holds only UI/local state; all data access goes through the
 *                    useStatementOfAccount hooks.
 * Dependencies: PageHeader, ExportButton (shared), Card, StatCard, Select, DatePicker, Button,
 *               Badge, Loader, EmptyState, ErrorState (ui), useStatementOfAccount,
 *               useProjectOptionsByClient, useClientOptions (Projects feature)
 * Export: default
 */
import { useMemo, useState } from 'react';
import { FileSearch, Search, RotateCcw } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { ExportButton, type ExportFormat } from '../../../components/shared/ExportButton';
import { Card, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { toast } from '../../../components/ui/Toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { useClientOptions } from '../../../features/projects/hooks/useProjects';
import {
  useStatementOfAccount,
  useProjectOptionsByClient,
} from '../../../features/statement-of-account/hooks/useStatementOfAccount';
import type { LedgerDocumentType } from '../../../types/statementOfAccount.types';

const ALL_PROJECTS_VALUE = 'all';

const DOC_BADGE_VARIANT: Record<LedgerDocumentType, 'success' | 'info' | 'warning' | 'danger'> = {
  Invoice: 'info',
  Receipt: 'success',
  'Credit Note': 'warning',
  'Debit Note': 'danger',
};

export default function StatementOfAccountPage() {
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [projectId, setProjectId] = useState<string>(ALL_PROJECTS_VALUE);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Only feeds the query on "Generate" — matches the wireframe's explicit Generate PDF/statement action
  const [appliedParams, setAppliedParams] = useState<
    { clientId: string; projectId?: string; dateFrom?: string; dateTo?: string } | undefined
  >(undefined);

  const clientOptionsQuery = useClientOptions();
  const projectOptionsQuery = useProjectOptionsByClient(clientId);

  const projectSelectOptions = useMemo(
    () => [{ value: ALL_PROJECTS_VALUE, label: 'All Projects' }, ...(projectOptionsQuery.data ?? [])],
    [projectOptionsQuery.data]
  );

  const statementQuery = useStatementOfAccount(appliedParams);

  function handleClientChange(value: string) {
    setClientId(value);
    setProjectId(ALL_PROJECTS_VALUE);
    setAppliedParams(undefined);
  }

  function handleGenerate() {
    if (!clientId) {
      toast.error('Choose a client first');
      return;
    }
    setAppliedParams({
      clientId,
      projectId: projectId === ALL_PROJECTS_VALUE ? undefined : projectId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function handleReset() {
    setClientId(undefined);
    setProjectId(ALL_PROJECTS_VALUE);
    setDateFrom('');
    setDateTo('');
    setAppliedParams(undefined);
  }

  function handleExport(format: ExportFormat) {
    toast.info(`Exporting statement as ${format.toUpperCase()}...`);
  }

  const statement = statementQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statement of Account"
        description="Complete invoice/payment history and outstanding balance for a client or project."
        action={statement && <ExportButton onExport={handleExport} formats={['pdf', 'csv', 'excel']} />}
      />

      {/* Choose */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <Select
              label="Client"
              placeholder={clientOptionsQuery.isLoading ? 'Loading clients...' : 'Select client'}
              options={clientOptionsQuery.data ?? []}
              value={clientId}
              onValueChange={handleClientChange}
            />
            <Select
              label="Project"
              placeholder={!clientId ? 'Select client first' : 'All Projects'}
              options={projectSelectOptions}
              value={projectId}
              onValueChange={setProjectId}
              disabled={!clientId}
            />
            <DatePicker label="Date From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <DatePicker label="Date To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <div className="flex items-center gap-2">
              <Button
                className="w-full"
                leftIcon={<Search className="h-4 w-4" />}
                onClick={handleGenerate}
                isLoading={statementQuery.isFetching}
              >
                Generate
              </Button>
              <Button variant="secondary" size="icon" onClick={handleReset} aria-label="Reset filters">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* No statement generated yet */}
      {!appliedParams && (
        <EmptyState
          icon={<FileSearch className="h-6 w-6" />}
          title="Choose a client to generate a statement"
          description="Pick a client (and optionally a single project + date range), then click Generate."
        />
      )}

      {appliedParams && statementQuery.isLoading && <Loader fullPage label="Generating statement..." />}

      {appliedParams && statementQuery.isError && <ErrorState onRetry={() => statementQuery.refetch()} />}

      {statement && (
        <>
          {/* Header block: Client / Project / Project Value */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium text-ink-500">Client</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">{statement.client.companyName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500">Project</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                    {statement.project ? statement.project.projectName : 'All Projects'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink-500">Project Value</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink-900">
                    {formatCurrency(statement.projectValue, false)}
                  </dd>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Invoiced" value={formatCurrency(statement.totalDebit, false)} />
            <StatCard label="Total Received" value={formatCurrency(statement.totalCredit, false)} />
            <StatCard
              label="Outstanding Balance"
              value={formatCurrency(statement.outstandingBalance, false)}
              tone={statement.outstandingBalance > 0 ? 'danger' : 'default'}
            />
          </div>

          {/* Display: ledger table */}
          <Card>
            <CardBody className="p-0">
              {statement.entries.length === 0 ? (
                <EmptyState
                  title="No transactions in this date range"
                  description="Try widening the Date From/To filters."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-surface-border bg-surface-bg">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Document</th>
                        <th className="px-5 py-3">Particulars</th>
                        {statement.entries.some((e) => e.projectName) && <th className="px-5 py-3">Project</th>}
                        <th className="px-5 py-3 text-right">Debit</th>
                        <th className="px-5 py-3 text-right">Credit</th>
                        <th className="px-5 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {statement.entries.map((entry) => (
                        <tr key={entry.id} className={entry.isOpeningBalance ? 'bg-surface-bg/60' : ''}>
                          <td className="whitespace-nowrap px-5 py-3 text-ink-700">{formatDate(entry.date)}</td>
                          <td className="whitespace-nowrap px-5 py-3">
                            {entry.isOpeningBalance ? (
                              <span className="text-ink-400">—</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant={DOC_BADGE_VARIANT[entry.documentType]}>{entry.documentType}</Badge>
                                <span className="text-ink-700">{entry.documentNo}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-ink-700">{entry.particulars}</td>
                          {statement.entries.some((e) => e.projectName) && (
                            <td className="px-5 py-3 text-ink-500">{entry.projectName ?? '—'}</td>
                          )}
                          <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-ink-900">
                            {entry.debit > 0 ? formatCurrency(entry.debit, false) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-success-700">
                            {entry.credit > 0 ? formatCurrency(entry.credit, false) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-ink-900">
                            {formatCurrency(entry.balance, false)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Bottom: Outstanding callout */}
          <Card
            className={
              statement.outstandingBalance > 0 ? 'border-danger-200 bg-danger-50' : 'border-success-200 bg-success-50'
            }
          >
            <CardBody className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">Outstanding Balance</span>
              <span
                className={
                  'text-xl font-bold ' + (statement.outstandingBalance > 0 ? 'text-danger-700' : 'text-success-700')
                }
              >
                {formatCurrency(statement.outstandingBalance, false)}
              </span>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
