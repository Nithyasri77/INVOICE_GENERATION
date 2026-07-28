/**
 * Purpose: TypeScript types for the AMC Contracts module
 * Responsibilities: API-friendly shape for AmcContract entity, status union, renewal history,
 *                    and dashboard stat cards
 * Dependencies: AmcStatus (common.types)
 * Export: AmcContract, AmcRenewalRecord, AmcStats
 */
import type { AmcStatus } from './common.types';

export interface AmcContract {
  id: string;
  amcNumber: string; // e.g. AMC-2026-006
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  contractValue: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  renewalDate: string; // ISO date — when the next renewal is due
  status: AmcStatus;
  assignedManager: string;
  notes?: string;
  createdDate: string;
}

export interface AmcRenewalRecord {
  id: string;
  amcId: string;
  renewedDate: string;
  previousEndDate: string;
  newEndDate: string;
  renewalValue: number;
  renewedBy: string;
}

export interface AmcStats {
  totalContracts: number;
  activeContracts: number;
  expiringThisMonth: number;
  renewalsDue: number;
  expiredContracts: number;
}
