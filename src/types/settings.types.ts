/**
 * Purpose: TypeScript types for the Settings module (BRD: Settings screen — Company Profile,
 *          GST Details, Bank Details, Invoice Number Format, Receipt Number Format, Reminder
 *          Templates, Terms & Conditions)
 * Responsibilities: Single source of truth for each Settings section's shape. Settings is a
 *                    single record (not a list) — sections are saved independently.
 * Dependencies: none
 * Export: CompanyProfile, GstDetails, BankDetails, NumberFormatSettings, ReminderTemplates,
 *          TermsAndConditions, AppSettings
 */
export interface CompanyProfile {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface GstDetails {
  gstNumber: string;
  panNumber: string;
  stateCode: string;
}

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

export interface NumberFormatSettings {
  invoiceNumberFormat: string; // e.g. "INV-{YYYY}-{SEQ}"
  invoiceNumberNext: number;
  receiptNumberFormat: string; // e.g. "RCT-{SEQ}"
  receiptNumberNext: number;
}

export interface ReminderTemplates {
  firstReminder: string;
  secondReminder: string;
  finalReminder: string;
}

export interface TermsAndConditions {
  invoiceTerms: string;
  quotationTerms: string;
}

export interface AppSettings {
  companyProfile: CompanyProfile;
  gstDetails: GstDetails;
  bankDetails: BankDetails;
  numberFormats: NumberFormatSettings;
  reminderTemplates: ReminderTemplates;
  termsAndConditions: TermsAndConditions;
}
