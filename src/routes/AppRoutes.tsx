/**
 * Purpose: The complete route tree for the app — maps every ROUTES path to its page component
 * Responsibilities: Wire AuthLayout (public) + ProtectedRoute + DashboardLayout (authenticated)
 *                    around all module pages; single place that defines "what renders where"
 * Dependencies: react-router-dom, DashboardLayout, AuthLayout, ProtectedRoute, all page components
 * Export: AppRoutes
 */
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './routePaths';

import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ClientsListPage from '../pages/clients/ClientsListPage';
import LeadsListPage from '../pages/leads/LeadsListPage';
import LeadDetailPage from '../pages/leads/LeadDetailPage';
import QuotationsListPage from '../pages/quotations/QuotationsListPage';
import NdaPage from '../pages/agreements/NdaPage';
import MsaPage from '../pages/agreements/MsaPage';
import WorkOrdersPage from '../pages/agreements/WorkOrdersPage';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import InvoicesListPage from '../pages/billing/invoices/InvoicesListPage';
import PaymentsReceivedListPage from '../pages/billing/payments-received/PaymentsReceivedListPage';
import ReceiptVouchersListPage from '../pages/billing/receipt-vouchers/ReceiptVouchersListPage';
import CreditNotesListPage from '../pages/billing/credit-notes/CreditNotesListPage';
import DebitNotesListPage from '../pages/billing/debit-notes/DebitNotesListPage';
import StatementOfAccountPage from '../pages/billing/statement-of-account/StatementOfAccountPage';
import AmcContractsListPage from '../pages/amc-contracts/AmcContractsListPage';
import AmcContractDetailPage from '../pages/amc-contracts/AmcContractDetailPage';
import ExpensesListPage from '../pages/expenses/ExpensesListPage';
import ReportsHubPage from '../pages/reports/ReportsHubPage';
import SettingsPage from '../pages/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          <Route path={ROUTES.CLIENTS} element={<ClientsListPage />} />
          <Route path={ROUTES.LEADS} element={<LeadsListPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailPage />} />
          <Route path={ROUTES.QUOTATIONS} element={<QuotationsListPage />} />

          <Route path={ROUTES.AGREEMENTS.NDA} element={<NdaPage />} />
          <Route path={ROUTES.AGREEMENTS.MSA} element={<MsaPage />} />
          <Route path={ROUTES.AGREEMENTS.WORK_ORDERS} element={<WorkOrdersPage />} />

          <Route path={ROUTES.PROJECTS} element={<ProjectsListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

          <Route path={ROUTES.BILLING.TAX_INVOICES} element={<InvoicesListPage />} />
          <Route path={ROUTES.BILLING.PAYMENTS_RECEIVED} element={<PaymentsReceivedListPage />} />
          <Route path={ROUTES.BILLING.RECEIPT_VOUCHERS} element={<ReceiptVouchersListPage />} />
          <Route path={ROUTES.BILLING.CREDIT_NOTES} element={<CreditNotesListPage />} />
          <Route path={ROUTES.BILLING.DEBIT_NOTES} element={<DebitNotesListPage />} />
          <Route path={ROUTES.BILLING.STATEMENT_OF_ACCOUNT} element={<StatementOfAccountPage />} />

          <Route path={ROUTES.AMC_CONTRACTS} element={<AmcContractsListPage />} />
          <Route path="/amc-contracts/:amcId" element={<AmcContractDetailPage />} />
          <Route path={ROUTES.EXPENSES} element={<ExpensesListPage />} />
          <Route path={ROUTES.REPORTS.ROOT} element={<ReportsHubPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
