/**
 * Purpose: Data-fetching hooks for the Statement of Account module
 * Responsibilities: Wrap statementOfAccountService in useQuery (caching, loading/error states);
 *                    also exposes useProjectOptionsByClient for the Project picker, which
 *                    depends on the Client select — this is the only thing
 *                    StatementOfAccountPage imports from the data layer
 * Dependencies: @tanstack/react-query, statementOfAccountService, projectService,
 *               statementOfAccount.types
 * Export: useStatementOfAccount, useProjectOptionsByClient
 */
import { useQuery } from '@tanstack/react-query';
import { getStatementOfAccount } from '../../../services/statementOfAccountService';
import { getProjects } from '../../../services/projectService';
import type { StatementOfAccountParams } from '../../../types/statementOfAccount.types';

const STATEMENT_KEY = 'statement-of-account';

export function useStatementOfAccount(params: StatementOfAccountParams | undefined) {
  return useQuery({
    queryKey: [STATEMENT_KEY, params],
    queryFn: () => getStatementOfAccount(params as StatementOfAccountParams),
    enabled: !!params?.clientId,
  });
}

export function useProjectOptionsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'options', clientId],
    queryFn: () => getProjects({ page: 1, pageSize: 100, clientId }),
    enabled: !!clientId,
    select: (result) => result.data.map((p) => ({ value: p.id, label: `${p.projectName} (${p.projectCode})` })),
  });
}
