/**
 * Purpose: Single source of truth for every route path string in the app
 * Responsibilities: Prevent magic strings scattered across AppRoutes, Sidebar, and Link/navigate calls
 * Dependencies: none
 * Export: ROUTES (const object, nested to mirror the sidebar/module structure)
 */

export const ROUTES = {
  DASHBOARD: '/',

  CLIENTS: '/clients',
  CLIENT_DETAIL: (id: string) => `/clients/${id}`,

  LEADS: '/leads',

  QUOTATIONS: '/quotations',
  QUOTATION_DETAIL: (id: string) => `/quotations/${id}`,

  AGREEMENTS: {
    ROOT: '/agreements',
    NDA: '/agreements/nda',
    MSA: '/agreements/msa',
    WORK_ORDERS: '/agreements/work-orders',
  },

  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,

  BILLING: {
    TAX_INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id: string) => `/billing/invoices/${id}`,
    PAYMENTS_RECEIVED: '/billing/payments',
    RECEIPT_VOUCHERS: '/billing/receipts',
    RECEIPT_DETAIL: (id: string) => `/billing/receipts/${id}`,
    CREDIT_NOTES: '/billing/credit-notes',
    DEBIT_NOTES: '/billing/debit-notes',
    STATEMENT_OF_ACCOUNT: '/billing/statement-of-account',
  },

  AMC_CONTRACTS: '/amc-contracts',
  AMC_CONTRACT_DETAIL: (id: string) => `/amc-contracts/${id}`,
  EXPENSES: '/expenses',

  REPORTS: {
    ROOT: '/reports',
    OUTSTANDING: '/reports/outstanding',
    REVENUE: '/reports/revenue',
    CLIENT_WISE_REVENUE: '/reports/client-revenue',
    PROJECT_WISE_REVENUE: '/reports/project-revenue',
    AMC_REVENUE: '/reports/amc-revenue',
    OVERDUE_PAYMENTS: '/reports/overdue-payments',
    MONTHLY_COLLECTIONS: '/reports/monthly-collections',
  },

  SETTINGS: '/settings',

  LOGIN: '/login',
} as const;
