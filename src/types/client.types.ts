/**
 * Purpose: TypeScript types for the Clients module (BRD: Clients Module Fields)
 * Responsibilities: Single source of truth for the Client entity shape, create/update payloads,
 *                    and list-query params — services/features/pages all import from here
 * Dependencies: common.types (ClientStatus, PaginatedResponse, TableQueryParams)
 * Export: Client, ClientFormValues, ClientListParams
 */
import type { ClientStatus } from './common.types';

export interface Client {
  id: string;
  clientCode: string; // e.g. CLT-0001 (BRD: Client ID)
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  status: ClientStatus;
  createdAt: string; // ISO date
  activeProjects: number; // derived stat shown on the list/detail view
  totalRevenue: number; // derived stat shown on the list/detail view
}

/** Shape used by the Add/Edit Client form (React Hook Form + Zod) */
export interface ClientFormValues {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  status: ClientStatus;
}

export interface ClientListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ClientStatus;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
