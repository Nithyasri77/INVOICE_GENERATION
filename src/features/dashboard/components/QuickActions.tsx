/**
 * Purpose: Dashboard's "Quick Actions" widget — one-click shortcuts into the most common flows
 * Responsibilities: Navigate to the relevant module list page (the Create Invoice/Receive Payment
 *                    modals themselves are built when we generate the Billing/Payments modules —
 *                    for now these route to the list page where that action lives)
 * Dependencies: react-router-dom, Button (ui), lucide-react, ROUTES
 * Export: QuickActions
 */
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Wallet, UserPlus, ListChecks } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../routes/routePaths';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Invoice', icon: <FilePlus2 className="h-4 w-4" />, onClick: () => navigate(ROUTES.BILLING.TAX_INVOICES) },
    { label: 'Receive Payment', icon: <Wallet className="h-4 w-4" />, onClick: () => navigate(ROUTES.BILLING.PAYMENTS_RECEIVED) },
    { label: 'Add Client', icon: <UserPlus className="h-4 w-4" />, onClick: () => navigate(ROUTES.CLIENTS) },
    { label: 'View Milestones', icon: <ListChecks className="h-4 w-4" />, onClick: () => navigate(ROUTES.PROJECTS) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="secondary"
          className="flex-col gap-2 h-auto py-4"
          leftIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
