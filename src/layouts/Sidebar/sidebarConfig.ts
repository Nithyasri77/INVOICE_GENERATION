/**
 * Purpose: Single source of truth for the sidebar navigation tree — matches the locked
 *          wireframe (three.jpeg) exactly. No items added, removed, or reordered.
 * Responsibilities: Define the nav structure once; Sidebar.tsx renders purely off this data
 * Dependencies: lucide-react icons, ROUTES
 * Export: NavItem type, SIDEBAR_NAV
 */
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  FileSignature,
  ShieldCheck,
  FileCheck2,
  ClipboardList,
  Briefcase,
  Receipt,
  FileInput,
  FileOutput,
  ScrollText,
  Wrench,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';

export interface NavItem {
  label: string;
  path?: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Clients', path: ROUTES.CLIENTS, icon: Users },
  { label: 'Leads', path: ROUTES.LEADS, icon: UserPlus },
  { label: 'Quotations', path: ROUTES.QUOTATIONS, icon: FileText },
  {
    label: 'Agreements',
    icon: FileSignature,
    children: [
      { label: 'NDA', path: ROUTES.AGREEMENTS.NDA, icon: ShieldCheck },
      { label: 'MSA', path: ROUTES.AGREEMENTS.MSA, icon: FileCheck2 },
      { label: 'Work Orders (SOW)', path: ROUTES.AGREEMENTS.WORK_ORDERS, icon: ClipboardList },
    ],
  },
  { label: 'Projects', path: ROUTES.PROJECTS, icon: Briefcase },
  {
    label: 'Billing',
    icon: Receipt,
    children: [
      { label: 'Tax Invoices', path: ROUTES.BILLING.TAX_INVOICES, icon: FileText },
      { label: 'Payments Received', path: ROUTES.BILLING.PAYMENTS_RECEIVED, icon: FileInput },
      { label: 'Receipt Vouchers', path: ROUTES.BILLING.RECEIPT_VOUCHERS, icon: FileOutput },
      { label: 'Credit Notes', path: ROUTES.BILLING.CREDIT_NOTES, icon: FileInput },
      { label: 'Debit Notes', path: ROUTES.BILLING.DEBIT_NOTES, icon: FileOutput },
      { label: 'Statement of Account', path: ROUTES.BILLING.STATEMENT_OF_ACCOUNT, icon: ScrollText },
    ],
  },
  { label: 'AMC Contracts', path: ROUTES.AMC_CONTRACTS, icon: Wrench },
  { label: 'Expenses', path: ROUTES.EXPENSES, icon: Wallet },
  { label: 'Reports', path: ROUTES.REPORTS.ROOT, icon: BarChart3 },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];
