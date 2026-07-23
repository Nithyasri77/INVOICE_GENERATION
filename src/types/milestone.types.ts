/**
 * Purpose: TypeScript types for the Milestones module (BRD: Milestone Landing Screen fields +
 *          Create Milestone Popup fields). Milestones are project-scoped and surface inside the
 *          Project Detail page's "Milestones" tab.
 * Responsibilities: Single source of truth for the Milestone entity shape, create/update
 *                    payloads, and dashboard-card stats shape
 * Dependencies: common.types (MilestoneStatus)
 * Export: Milestone, MilestoneFormValues, MilestoneStats
 */
import type { MilestoneStatus } from './common.types';

export interface Milestone {
  id: string;
  milestoneCode: string; // e.g. MS-0001 (BRD: Milestone ID)
  projectId: string;
  milestoneName: string;
  description: string;
  amount: number;
  dueDate: string; // ISO date
  status: MilestoneStatus;
  linkedDeliverable: string;
}

/** Shape used by the Create/Edit Milestone popup (React Hook Form + Zod) */
export interface MilestoneFormValues {
  milestoneName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  linkedDeliverable: string;
}

/** Milestone Dashboard Cards (BRD): Total Milestones, Completed Value, Pending Value, Overdue Milestones */
export interface MilestoneStats {
  totalMilestones: number;
  completedValue: number;
  pendingValue: number;
  overdueMilestones: number;
}
