/**
 * Purpose: TypeScript types for the Projects module (BRD: Projects Module Fields + Project View Tabs)
 * Responsibilities: Single source of truth for the Project entity shape, create/update payloads,
 *                    and list-query params — services/features/pages all import from here
 * Dependencies: common.types (ProjectStatus, PaginatedResponse)
 * Export: Project, ProjectFormValues, ProjectListParams
 */
import type { ProjectStatus } from './common.types';

export interface Project {
  id: string;
  projectCode: string; // e.g. PRJ-0001 (BRD: Project ID)
  projectName: string;
  clientId: string;
  clientName: string; // denormalized for table display
  quotationNo: string;
  msaNo: string;
  projectValue: number;
  startDate: string; // ISO date
  expectedDelivery: string; // ISO date
  status: ProjectStatus;
  projectManager: string;
  // Financial Summary (BRD: Milestones & Receipts doc — Project View > Overview)
  receivedTillDate: number;
}

/** Shape used by the Add/Edit Project form (React Hook Form + Zod) */
export interface ProjectFormValues {
  projectName: string;
  clientId: string;
  quotationNo: string;
  msaNo: string;
  projectValue: number;
  startDate: string;
  expectedDelivery: string;
  status: ProjectStatus;
  projectManager: string;
}

export interface ProjectListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
