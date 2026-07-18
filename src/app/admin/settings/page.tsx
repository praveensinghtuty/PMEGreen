import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import {
  saveSettingsAction,
  uploadSiteAssetAction,
} from "@/features/admin/actions/admin";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { getAdminSettings } from "@/features/admin/queries/settings";

export const metadata = {
  title: "Admin Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = (await searchParams) ?? {};
  const settings = await getAdminSettings();

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Website settings</h1>
        <p className="mt-3 text-muted-foreground">
          Manage existing public store settings used by checkout and storefront
          display.
        </p>
        <AdminNotice
          error={singleParam(params.adminError)}
          success={singleParam(params.adminSuccess)}
        />
        <form
          action={saveSettingsAction}
          className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
        >
          <Field
            defaultValue={settings.businessName}
            label="Store name"
            name="businessName"
          />
          <Field
            defaultValue={settings.businessPhone}
            label="Contact phone"
            name="businessPhone"
            required={false}
          />
          <Field
            defaultValue={settings.businessEmail}
            label="Contact email"
            name="businessEmail"
            required={false}
          />
          <Field
            defaultValue={settings.businessAddress}
            label="Public address"
            name="businessAddress"
            required={false}
          />
          <Field
            defaultValue={settings.businessLogo}
            label="Logo storage path"
            name="businessLogo"
            required={false}
          />
          <Field
            defaultValue={String(settings.shippingDefaultCharge)}
            label="Default shipping charge"
            name="shippingDefaultCharge"
            type="number"
          />
          <Field
            defaultValue={settings.paymentUpiId}
            label="UPI ID"
            name="paymentUpiId"
            required={false}
          />
          <Field
            defaultValue={settings.paymentUpiQr}
            label="UPI QR storage path"
            name="paymentUpiQr"
            required={false}
          />
          <Button type="submit">Save settings</Button>
        </form>
        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Upload site asset</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a logo or UPI QR into the existing site-assets bucket and
            save the corresponding setting.
          </p>
          <form action={uploadSiteAssetAction} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Asset target
              <select
                className="h-11 rounded-md border border-input bg-background px-3"
                name="settingKey"
              >
                <option value="business.logo">Business logo</option>
                <option value="payment.upi_qr">UPI QR</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Image file
              <input
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                name="asset"
                required
                type="file"
              />
            </label>
            <Button type="submit">Upload asset</Button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

function Field({
  defaultValue = "",
  label,
  name,
  required = true,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className="h-11 rounded-md border border-input bg-background px-3"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
