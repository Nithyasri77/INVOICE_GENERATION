/**
 * Purpose: AMC Contract Detail page — full view of a single contract per module spec
 *          ("Overview, Invoices, Payments, Renewal History, Notes" + Renew/Generate Invoice/Mark Renewed)
 * Responsibilities: Compose read-only overview card + tabbed sections; wire Edit/Renew/
 *                    Mark Renewed/Generate Invoice actions
 * NOTE: Invoices/Payments tabs show contract-linked records once the Billing module's service
 *       layer (from your collaborators' repo) is merged in — for now they show an honest empty
 *       state rather than invented data, since AMC contracts don't yet have real invoice links.
 * Dependencies: useAmcContract/useAmcRenewalHistory/useMarkAmcRenewed, Tabs, AmcContractFormModal,
 *               RenewContractDialog, AmcRenewalHistoryList
 * Export: default
 */
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, RefreshCw, CheckCircle2, FilePlus2, Building2, Briefcase, User, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useAmcContract, useAmcRenewalHistory, useMarkAmcRenewed } from '../../features/amc-contracts/hooks/useAmcContracts';
import { AmcContractFormModal } from '../../features/amc-contracts/components/AmcContractFormModal';
import { RenewContractDialog } from '../../features/amc-contracts/components/RenewContractDialog';
import { AmcRenewalHistoryList } from '../../features/amc-contracts/components/AmcRenewalHistoryList';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';

export default function AmcContractDetailPage() {
  const { amcId } = useParams<{ amcId: string }>();
  const navigate = useNavigate();
  const editModal = useDisclosure();
  const renewDialog = useDisclosure();

  const contractQuery = useAmcContract(amcId);
  const historyQuery = useAmcRenewalHistory(amcId);
  const markRenewed = useMarkAmcRenewed();

  if (contractQuery.isLoading) return <Loader fullPage label="Loading contract..." />;
  if (contractQuery.isError || !contractQuery.data) {
    return <ErrorState title="AMC contract not found" onRetry={() => contractQuery.refetch()} />;
  }

  const contract = contractQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.amcNumber}
        breadcrumbs={[{ label: 'AMC Contracts', href: ROUTES.AMC_CONTRACTS }, { label: contract.amcNumber }]}
        action={
          <>
            <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={editModal.open}>
              Edit
            </Button>
            <Button
              variant="secondary"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              disabled={contract.status === 'Active'}
              onClick={() => markRenewed.mutate(contract.id)}
            >
              Mark Renewed
            </Button>
            <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={renewDialog.open}>
              Renew Contract
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <StatusBadge status={contract.status} />
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Client" value={contract.clientName} />
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Project" value={contract.projectName} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Assigned Manager" value={contract.assignedManager} />
          <InfoRow icon={<Wallet className="h-4 w-4" />} label="Contract Value" value={formatCurrency(contract.contractValue)} />
          <InfoRow label="Start Date" value={formatDate(contract.startDate)} />
          <InfoRow label="End Date" value={formatDate(contract.endDate)} />
          <InfoRow label="Renewal Date" value={formatDate(contract.renewalDate)} />
        </CardBody>
      </Card>

      <Card>
        <Tabs defaultValue="invoices">
          <div className="px-5 pt-4">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="renewal-history">Renewal History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          <CardBody>
            <TabsContent value="invoices">
              <EmptyState
                icon={<FilePlus2 className="h-6 w-6" />}
                title="No invoices linked yet"
                description="Generate an invoice for this AMC contract from the Billing module once it's merged in."
                action={
                  <Button size="sm" leftIcon={<FilePlus2 className="h-4 w-4" />} onClick={() => navigate(ROUTES.BILLING.TAX_INVOICES)}>
                    Generate Invoice
                  </Button>
                }
              />
            </TabsContent>

            <TabsContent value="payments">
              <EmptyState title="No payments recorded yet" description="Payments against this contract's invoices will appear here." />
            </TabsContent>

            <TabsContent value="renewal-history">
              <AmcRenewalHistoryList records={historyQuery.data ?? []} />
            </TabsContent>

            <TabsContent value="notes">
              {contract.notes ? (
                <p className="text-sm text-ink-700">{contract.notes}</p>
              ) : (
                <EmptyState title="No notes added" />
              )}
            </TabsContent>
          </CardBody>
        </Tabs>
      </Card>

      <AmcContractFormModal open={editModal.isOpen} onOpenChange={editModal.close} contract={contract} />
      <RenewContractDialog open={renewDialog.isOpen} onOpenChange={renewDialog.close} contract={contract} />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm text-ink-900">{value}</p>
    </div>
  );
}
