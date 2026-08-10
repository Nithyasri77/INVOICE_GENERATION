/**
 * Purpose: Utility helper to resolve full Client details for Invoices and Payments Received
 * Responsibilities: Map client company names, invoice numbers, or project names to phone, email, address, and GSTIN
 * Rules: NO hardcoded dummy fallback phone numbers or fake fallback emails when client info is missing.
 */
import type { Client } from '../types/client.types';

export const CLIENT_DATABASE: Record<string, Partial<Client>> = {
  'Aravind Textiles Pvt Ltd': {
    companyName: 'Aravind Textiles Pvt Ltd',
    contactPerson: 'Aravind Kumar',
    phone: '+91 98765 43210',
    email: 'aravind@aravindtextiles.com',
    gstNumber: '33AAACA1234B1Z5',
    address: 'Plot 12, SIDCO Industrial Estate, Coimbatore, TN 641021',
  },
  'Nithya Health Solutions': {
    companyName: 'Nithya Health Solutions',
    contactPerson: 'Nithya Sri',
    phone: '+91 90000 11122',
    email: 'nithya@nithyahealth.in',
    gstNumber: '33AAACN5678C1Z2',
    address: '4th Floor, Anna Nagar, Chennai, TN 600040',
  },
  'Prime Logistics Corp': {
    companyName: 'Prime Logistics Corp',
    contactPerson: 'Suresh Babu',
    phone: '+91 87654 32109',
    email: 'suresh@primelogistics.com',
    gstNumber: '33AAACP9012D1Z8',
    address: 'No. 8, GST Road, Trichy, TN 620001',
  },
  'BlueWave Retail': {
    companyName: 'BlueWave Retail',
    contactPerson: 'Divya R',
    phone: '+91 91234 56789',
    email: 'divya@bluewaveretail.com',
    gstNumber: '33AAACB3456E1Z1',
    address: 'Tower B, Tidel Park, Chennai, TN 600113',
  },
  'Karthik Constructions': {
    companyName: 'Karthik Constructions',
    contactPerson: 'Karthik Raja',
    phone: '+91 99887 76655',
    email: 'karthik@karthikconstructions.com',
    gstNumber: '33AAACK7890F1Z4',
    address: 'Sathy Road, Erode, TN 638001',
  },
};

// Project & Invoice mappings to handle any indirect lookup
const PROJECT_TO_CLIENT_MAP: Record<string, string> = {
  'ERP Revamp — Phase 1': 'Aravind Textiles Pvt Ltd',
  'Patient Portal Redesign': 'Nithya Health Solutions',
  'Fleet Tracking Dashboard': 'Prime Logistics Corp',
  'E-commerce Storefront': 'BlueWave Retail',
  'Site Billing & Inventory Tool': 'Karthik Constructions',
};

const INVOICE_TO_CLIENT_MAP: Record<string, string> = {
  'INV-2025-001': 'Aravind Textiles Pvt Ltd',
  'INV-2025-002': 'Aravind Textiles Pvt Ltd',
  'INV-2025-003': 'Nithya Health Solutions',
  'INV-2025-004': 'BlueWave Retail',
  'INV-2025-005': 'Prime Logistics Corp',
  'INV-2025-006': 'Karthik Constructions',
};

export function registerClientInfo(client: Partial<Client>) {
  if (client.companyName) {
    CLIENT_DATABASE[client.companyName] = {
      ...CLIENT_DATABASE[client.companyName],
      ...client,
    };
  }
}

export function getClientInfoByName(
  clientNameOrQuery?: string,
  invoiceNo?: string,
  projectName?: string
): Partial<Client> {
  // Direct match by client name
  if (clientNameOrQuery && CLIENT_DATABASE[clientNameOrQuery]) {
    return CLIENT_DATABASE[clientNameOrQuery];
  }

  // Case-insensitive match
  if (clientNameOrQuery) {
    const lowerQuery = clientNameOrQuery.toLowerCase().trim();
    const matchedKey = Object.keys(CLIENT_DATABASE).find(
      (key) => key.toLowerCase().trim() === lowerQuery
    );
    if (matchedKey) {
      return CLIENT_DATABASE[matchedKey];
    }
  }

  // Match by invoice number if available
  if (invoiceNo && INVOICE_TO_CLIENT_MAP[invoiceNo]) {
    const matchedClient = INVOICE_TO_CLIENT_MAP[invoiceNo];
    if (CLIENT_DATABASE[matchedClient]) {
      return CLIENT_DATABASE[matchedClient];
    }
  }

  // Match by project name if available
  if (projectName && PROJECT_TO_CLIENT_MAP[projectName]) {
    const matchedClient = PROJECT_TO_CLIENT_MAP[projectName];
    if (CLIENT_DATABASE[matchedClient]) {
      return CLIENT_DATABASE[matchedClient];
    }
  }

  // Check if clientNameOrQuery itself matches a project name or invoice number
  if (clientNameOrQuery && PROJECT_TO_CLIENT_MAP[clientNameOrQuery]) {
    const matchedClient = PROJECT_TO_CLIENT_MAP[clientNameOrQuery];
    if (CLIENT_DATABASE[matchedClient]) {
      return CLIENT_DATABASE[matchedClient];
    }
  }

  if (clientNameOrQuery && INVOICE_TO_CLIENT_MAP[clientNameOrQuery]) {
    const matchedClient = INVOICE_TO_CLIENT_MAP[clientNameOrQuery];
    if (CLIENT_DATABASE[matchedClient]) {
      return CLIENT_DATABASE[matchedClient];
    }
  }

  // Do NOT hardcode dummy phone numbers or fake emails!
  return {
    companyName: clientNameOrQuery || 'Valued Client',
    contactPerson: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
  };
}
