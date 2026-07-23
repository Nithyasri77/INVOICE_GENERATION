# Shine Craft Technologies — Revenue & Billing Management Software

Production-architecture SaaS billing app for Shine Craft Technologies, built to the approved BRD/wireframes.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173) in your browser.

**Login page:** any email/password will work — auth is currently mocked (see `src/contexts/AuthContext.tsx`,
clearly marked with a TODO for when the real auth API is connected).

## What's built so far (Steps 1–8 of the agreed workflow)

- ✅ Full design system (`src/components/ui`, `src/components/shared`) — Button, Input, Select,
  DatePicker, Badge, Card, StatCard, ChartCard, Modal, Drawer, Toast, Loader, Skeleton, EmptyState,
  ErrorState, Pagination, Dropdown, Tooltip, Tabs, Breadcrumbs, DataTable, StatusBadge, SearchBar,
  FilterBar, ActionMenu, ExportButton, PageHeader
- ✅ Layouts — Sidebar (locked nav tree, exactly matching your wireframe), Topbar, DashboardLayout, AuthLayout
- ✅ Routing — every sidebar item routes to a page (built pages or placeholders)
- ✅ Dashboard — fully built: 8 stat cards, Revenue Overview + Outstanding Trend charts, Quick Actions

- ✅ Clients — fully built: list (search/filter/sort/paginate), Add/Edit modal (validated with
  Zod), View drawer, Delete, seeded with sample data via `clientService` (swap-in-ready for the
  real API)
- ✅ Projects — fully built: list (search/filter by status+client/sort/paginate), Add/Edit modal
  (Client picker sourced from Clients module, MSA/Quotation No, dates, status), Project Detail
  page with Financial Summary (Project Value / Received Till Date / Outstanding Balance) and the
  full Project View Tabs shell (Milestones/Invoices/Payments/Receipts/Files/Notes render a
  "coming soon" note until those modules are built)

- ✅ Milestones — fully built as the Project Detail page's "Milestones" tab (per the locked
  wireframe, Milestones is not a standalone sidebar menu — it's project-scoped): Milestone
  Dashboard Cards (Total/Completed Value/Pending Value/Overdue), milestone timeline table
  (Milestone ID/Name/Amount/Due Date/Linked Deliverable/Status), Create/Edit popup, Delete —
  seeded with sample data via `milestoneService` (swap-in-ready for the real API)

## What's still a placeholder

Every module except Dashboard, Clients, Projects, and Milestones currently renders a "coming
soon" placeholder page/tab. These get built one at a time, in the order agreed: Quotations →
Invoices → Payments → Receipts → Reports → Settings, plus the additional nav items from your
locked wireframe (Leads, Agreements, Credit/Debit Notes, Statement of Account, AMC Contracts,
Expenses).

## Tech Stack

React 19, TypeScript (strict, no `any`), Vite, React Router, Tailwind CSS, Radix UI primitives
(styled to a shadcn-like system), Lucide icons, React Hook Form + Zod, TanStack Table + Query,
react-hot-toast, Recharts, Axios.

## Verifying the build yourself

```bash
npm run build   # tsc -b && vite build — should complete with zero type errors
```
