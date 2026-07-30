import type { MsaStatus } from './common.types';

export interface Msa {
  id: string;
  msaNo: string;
  clientId: string;
  clientName: string;
  effectiveDate: string;
  endDate?: string;
  paymentTerms: string;
  governingLaw?: string;
  terminationNoticeDays?: number;
  status: MsaStatus;
  attachmentRef?: string;
  notes: string;
  version?: string;
  createdBy?: string;
  createdDate?: string;
  lastUpdated?: string;
  projectName?: string;
}

export interface MsaFormValues {
  clientId: string;
  effectiveDate: string;
  endDate?: string;
  paymentTerms: string;
  governingLaw?: string;
  terminationNoticeDays?: number;
  status: MsaStatus;
  attachmentRef?: string;
  notes: string;
}

export interface MsaListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: MsaStatus;
  clientId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
