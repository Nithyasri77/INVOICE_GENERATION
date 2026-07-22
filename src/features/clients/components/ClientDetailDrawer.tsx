/**
 * Purpose: Read-only quick-view of a Client, opened by clicking a row / "View" action
 * Responsibilities: Show full Client fields + derived stats (active projects, revenue) in a
 *                    slide-in panel; offers Edit/Close actions
 * Dependencies: Drawer/DrawerBody/DrawerFooter (ui), StatusBadge (shared), Button (ui)
 * Export: ClientDetailDrawer
 */
import { Building2, Mail, Phone, MapPin, FileText, Briefcase } from 'lucide-react';
import { Drawer, DrawerBody, DrawerFooter } from '../../../components/ui/Drawer';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatCompactCurrency } from '../../../utils/formatCurrency';
import type { Client } from '../../../types/client.types';

export interface ClientDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onEdit: () => void;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-ink-400">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-sm text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export function ClientDetailDrawer({ open, onOpenChange, client, onEdit }: ClientDetailDrawerProps) {
  if (!client) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={client.clientCode} width="md">
      <DrawerBody className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">{client.companyName}</h2>
          <div className="mt-1">
            <StatusBadge status={client.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface-bg p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Active Projects</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">{client.activeProjects}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Revenue</p>
            <p className="mt-1 text-lg font-semibold text-ink-900">{formatCompactCurrency(client.totalRevenue)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow icon={<Building2 className="h-4 w-4" />} label="Contact Person" value={client.contactPerson} />
          <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={client.phone} />
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={client.email} />
          <DetailRow icon={<FileText className="h-4 w-4" />} label="GST Number" value={client.gstNumber} />
          <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={client.address} />
          <DetailRow icon={<Briefcase className="h-4 w-4" />} label="Client Since" value={client.createdAt} />
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button onClick={onEdit}>Edit Client</Button>
      </DrawerFooter>
    </Drawer>
  );
}
