/**
 * Purpose: Utility helper to resolve full Client details for Invoices and Payments Received
 * Responsibilities: Map client company names or IDs to phone, email, address, and GSTIN from SEED/API data
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

export function getClientInfoByName(clientName: string): Partial<Client> {
  if (CLIENT_DATABASE[clientName]) {
    return CLIENT_DATABASE[clientName];
  }
  return {
    companyName: clientName,
    contactPerson: 'Accounts Team',
    phone: '+91 98765 00000',
    email: `accounts@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    address: 'Corporate Office Address',
  };
}
