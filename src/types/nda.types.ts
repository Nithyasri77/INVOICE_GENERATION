import type { NdaStatus } from './common.types';

export interface Nda {
  id: string;
  ndaNo: string;
  clientId: string;
  clientName: string;
  signedDate: string;
  expiryDate?: string;
  status: NdaStatus;
  attachmentRef?: string;
  notes: string;
}

export interface NdaFormValues {
  clientId: string;
  signedDate: string;
  expiryDate?: string;
  status: NdaStatus;
  attachmentRef?: string;
  notes: string;
}

export interface NdaListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: NdaStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
