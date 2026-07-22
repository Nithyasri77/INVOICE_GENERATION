/**
 * Purpose: Tabbed navigation — drives Project detail view (Overview/Milestones/Invoices/
 *          Payments/Receipts/Files/Notes) and Settings page sections
 * Responsibilities: Accessible tabs (keyboard arrow nav) with underline active indicator
 * Dependencies: @radix-ui/react-tabs, cn()
 * Export: Tabs, TabsList, TabsTrigger, TabsContent
 */
import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../../utils/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('flex items-center gap-1 border-b border-surface-border', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        '-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-500 transition-colors',
        'hover:text-ink-900',
        'data-[state=active]:border-primary-600 data-[state=active]:text-primary-600',
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: RadixTabs.TabsContentProps) {
  return <RadixTabs.Content className={cn('pt-5 animate-fade-in', className)} {...props} />;
}
