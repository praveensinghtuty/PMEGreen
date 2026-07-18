import type { CustomerAddress } from "@/features/addresses/types/address";
import { saveAddressAction } from "@/features/addresses/actions/address";
import { Button } from "@/components/ui/button";

type AddressFormProps = {
  address?: CustomerAddress;
  returnPath?: string;
};

export function AddressForm({
  address,
  returnPath = "/addresses",
}: AddressFormProps) {
  return (
    <form
      action={saveAddressAction}
      className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5"
    >
      <input name="id" type="hidden" value={address?.id ?? ""} />
      <input name="returnPath" type="hidden" value={returnPath} />
      <Field
        defaultValue={address?.label}
        label="Address label"
        name="label"
        placeholder="Home"
      />
      <Field
        defaultValue={address?.fullName}
        label="Recipient name"
        name="fullName"
      />
      <Field
        defaultValue={address?.phone}
        inputMode="tel"
        label="Mobile number"
        name="phone"
        pattern="[6-9][0-9]{9}"
      />
      <Field
        defaultValue={address?.postalCode}
        inputMode="numeric"
        label="Postal code"
        name="postalCode"
        pattern="[0-9]{6}"
      />
      <Field
        className="sm:col-span-2"
        defaultValue={address?.addressLine1}
        label="Address line 1"
        name="addressLine1"
      />
      <Field
        className="sm:col-span-2"
        defaultValue={address?.addressLine2 ?? ""}
        label="Address line 2"
        name="addressLine2"
        required={false}
      />
      <Field defaultValue={address?.city} label="City or town" name="city" />
      <Field
        defaultValue={address?.district}
        label="District"
        name="district"
      />
      <Field
        defaultValue={address?.landmark ?? ""}
        label="Landmark"
        name="landmark"
        required={false}
      />
      <Field defaultValue="Tamil Nadu" label="State" name="state" readOnly />
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:col-span-2">
        <input
          className="size-4 accent-primary"
          defaultChecked={address?.isDefault}
          name="isDefault"
          type="checkbox"
        />
        Make this the default shipping address
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">
          {address ? "Save address" : "Add address"}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  className?: string;
  defaultValue?: string;
  inputMode?: "numeric" | "tel";
  label: string;
  name: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
};

function Field({
  className = "",
  defaultValue = "",
  inputMode,
  label,
  name,
  pattern,
  placeholder,
  readOnly,
  required = true,
}: FieldProps) {
  return (
    <label className={`grid gap-2 text-sm font-medium ${className}`}>
      {label}
      <input
        className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:opacity-60"
        defaultValue={defaultValue}
        inputMode={inputMode}
        name={name}
        pattern={pattern}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
      />
    </label>
  );
}
