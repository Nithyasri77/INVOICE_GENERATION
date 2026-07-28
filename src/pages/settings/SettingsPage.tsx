/**
 * Purpose: Settings module landing page (BRD: Settings — Company Profile, GST Details, Bank
 *          Details, Invoice Number Format, Receipt Number Format, Reminder Templates,
 *          Terms & Conditions)
 * Responsibilities: Tabs shell over each settings section's own form — every section saves
 *                    independently via its own mutation hook, so editing one never risks another
 * Dependencies: PageHeader (shared), Tabs (ui), Loader, useSettings, each section's Form component
 * Export: default
 */
import { PageHeader } from '../../components/shared/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Loader } from '../../components/ui/Loader';
import { useSettings } from '../../features/settings/hooks/useSettings';
import { CompanyProfileForm } from '../../features/settings/components/CompanyProfileForm';
import { GstDetailsForm } from '../../features/settings/components/GstDetailsForm';
import { BankDetailsForm } from '../../features/settings/components/BankDetailsForm';
import { NumberFormatsForm } from '../../features/settings/components/NumberFormatsForm';
import { ReminderTemplatesForm } from '../../features/settings/components/ReminderTemplatesForm';
import { TermsAndConditionsForm } from '../../features/settings/components/TermsAndConditionsForm';

export default function SettingsPage() {
  const settingsQuery = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Company details, GST, bank info, numbering, and templates used across billing." />

      {settingsQuery.isLoading || !settingsQuery.data ? (
        <Loader fullPage label="Loading settings..." />
      ) : (
        <Tabs defaultValue="company-profile">
          <TabsList>
            <TabsTrigger value="company-profile">Company Profile</TabsTrigger>
            <TabsTrigger value="gst-details">GST Details</TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
            <TabsTrigger value="number-formats">Number Formats</TabsTrigger>
            <TabsTrigger value="reminder-templates">Reminder Templates</TabsTrigger>
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="company-profile">
            <CompanyProfileForm initialValues={settingsQuery.data.companyProfile} />
          </TabsContent>
          <TabsContent value="gst-details">
            <GstDetailsForm initialValues={settingsQuery.data.gstDetails} />
          </TabsContent>
          <TabsContent value="bank-details">
            <BankDetailsForm initialValues={settingsQuery.data.bankDetails} />
          </TabsContent>
          <TabsContent value="number-formats">
            <NumberFormatsForm initialValues={settingsQuery.data.numberFormats} />
          </TabsContent>
          <TabsContent value="reminder-templates">
            <ReminderTemplatesForm initialValues={settingsQuery.data.reminderTemplates} />
          </TabsContent>
          <TabsContent value="terms">
            <TermsAndConditionsForm initialValues={settingsQuery.data.termsAndConditions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
