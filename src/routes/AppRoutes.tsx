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
import ExpensesListPage from '../pages/expenses/ExpensesListPage';
import ReportsHubPage from '../pages/reports/ReportsHubPage';
import SettingsPage from '../pages/settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/leads" element={<LeadsListPage />} />
          <Route path="/quotations" element={<QuotationsListPage />} />

          <Route path="/agreements/nda" element={<NdaPage />} />
          <Route path="/agreements/msa" element={<MsaPage />} />
          <Route path="/agreements/work-orders" element={<WorkOrdersPage />} />

          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

          <Route path="/billing/invoices" element={<InvoicesListPage />} />
          <Route path="/billing/payments-received" element={<PaymentsReceivedListPage />} />
          <Route path={ROUTES.BILLING.RECEIPT_VOUCHERS} element={<ReceiptVouchersListPage />} />
          <Route path="/billing/credit-notes" element={<CreditNotesListPage />} />
          <Route path="/billing/debit-notes" element={<DebitNotesListPage />} />
          <Route path="/billing/statement-of-account" element={<StatementOfAccountPage />} />

          <Route path="/amc-contracts" element={<AmcContractsListPage />} />
          <Route path="/expenses" element={<ExpensesListPage />} />
          <Route path="/reports" element={<ReportsHubPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
