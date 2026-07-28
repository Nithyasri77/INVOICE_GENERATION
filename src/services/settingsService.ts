/**
 * Purpose: Data access layer for the Settings module (BRD: Settings screen)
 * Responsibilities: Expose getSettings and one update function per section (Company Profile, GST
 *                    Details, Bank Details, Number Formats, Reminder Templates, Terms &
 *                    Conditions) — settings is a single record, not a list, and each section saves
 *                    independently so one section's edit doesn't block another's
 * NOTE: No Settings API endpoint exists yet. Each function is wired to call axiosClient (see the
 *       commented real call) but currently operates on an in-memory object so the UI is reviewable
 *       end-to-end. Swap the TODO block for the real call once the backend is live.
 * Dependencies: axiosClient, settings.types
 * Export: getSettings, updateCompanyProfile, updateGstDetails, updateBankDetails,
 *          updateNumberFormats, updateReminderTemplates, updateTermsAndConditions
 */
import type {
  AppSettings,
  BankDetails,
  CompanyProfile,
  GstDetails,
  NumberFormatSettings,
  ReminderTemplates,
  TermsAndConditions,
} from '../types/settings.types';

let SETTINGS: AppSettings = {
  companyProfile: {
    companyName: 'Shine Craft Technologies',
    contactPerson: 'Ajith Kumar',
    phone: '+91 90000 12345',
    email: 'hello@shinecrafttech.in',
    address: 'No. 21, Anna Salai, Chennai, Tamil Nadu 600002',
  },
  gstDetails: {
    gstNumber: '33AACST1234B1Z5',
    panNumber: 'AACST1234B',
    stateCode: '33 — Tamil Nadu',
  },
  bankDetails: {
    bankName: 'HDFC Bank',
    accountHolderName: 'Shine Craft Technologies',
    accountNumber: '50100123456789',
    ifscCode: 'HDFC0001234',
    branch: 'T. Nagar, Chennai',
  },
  numberFormats: {
    invoiceNumberFormat: 'INV-{YYYY}-{SEQ}',
    invoiceNumberNext: 7,
    receiptNumberFormat: 'RCT-{SEQ}',
    receiptNumberNext: 6,
  },
  reminderTemplates: {
    firstReminder:
      'Hi {clientName}, this is a friendly reminder that invoice {invoiceNo} for {amount} is due on {dueDate}. Please let us know if you have any questions.',
    secondReminder:
      'Hi {clientName}, invoice {invoiceNo} for {amount} is now past due. Please arrange payment at the earliest to avoid any delay in ongoing work.',
    finalReminder:
      'Hi {clientName}, invoice {invoiceNo} for {amount} remains unpaid despite earlier reminders. Please settle this at the earliest to avoid escalation.',
  },
  termsAndConditions: {
    invoiceTerms:
      'Payment is due within the period specified on the invoice. Late payments may attract additional charges as per the signed MSA.',
    quotationTerms:
      'This quotation is valid until the date specified above. Prices are subject to change after expiry. GST will be charged as applicable.',
  },
};

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getSettings(): Promise<AppSettings> {
  // TODO: replace with `const { data } = await axiosClient.get<AppSettings>('/settings'); return data;`
  return delay({ ...SETTINGS });
}

export async function updateCompanyProfile(values: CompanyProfile): Promise<CompanyProfile> {
  // TODO: replace with `const { data } = await axiosClient.put<CompanyProfile>('/settings/company-profile', values); return data;`
  SETTINGS = { ...SETTINGS, companyProfile: values };
  return delay(values);
}

export async function updateGstDetails(values: GstDetails): Promise<GstDetails> {
  // TODO: replace with `const { data } = await axiosClient.put<GstDetails>('/settings/gst-details', values); return data;`
  SETTINGS = { ...SETTINGS, gstDetails: values };
  return delay(values);
}

export async function updateBankDetails(values: BankDetails): Promise<BankDetails> {
  // TODO: replace with `const { data } = await axiosClient.put<BankDetails>('/settings/bank-details', values); return data;`
  SETTINGS = { ...SETTINGS, bankDetails: values };
  return delay(values);
}

export async function updateNumberFormats(values: NumberFormatSettings): Promise<NumberFormatSettings> {
  // TODO: replace with `const { data } = await axiosClient.put<NumberFormatSettings>('/settings/number-formats', values); return data;`
  SETTINGS = { ...SETTINGS, numberFormats: values };
  return delay(values);
}

export async function updateReminderTemplates(values: ReminderTemplates): Promise<ReminderTemplates> {
  // TODO: replace with `const { data } = await axiosClient.put<ReminderTemplates>('/settings/reminder-templates', values); return data;`
  SETTINGS = { ...SETTINGS, reminderTemplates: values };
  return delay(values);
}

export async function updateTermsAndConditions(values: TermsAndConditions): Promise<TermsAndConditions> {
  // TODO: replace with `const { data } = await axiosClient.put<TermsAndConditions>('/settings/terms', values); return data;`
  SETTINGS = { ...SETTINGS, termsAndConditions: values };
  return delay(values);
}
