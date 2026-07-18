import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/features/addresses/actions/address";
import type { CustomerAddress } from "@/features/addresses/types/address";
import { Button } from "@/components/ui/button";

type AddressCardProps = {
  address: CustomerAddress;
  returnPath?: string;
};

export function AddressCard({
  address,
  returnPath = "/addresses",
}: AddressCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{address.label}</h2>
          {address.isDefault ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Default
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {!address.isDefault ? (
            <form action={setDefaultAddressAction}>
              <input name="id" type="hidden" value={address.id} />
              <input name="returnPath" type="hidden" value={returnPath} />
              <Button size="sm" type="submit" variant="outline">
                Set default
              </Button>
            </form>
          ) : null}
          <form action={deleteAddressAction}>
            <input name="id" type="hidden" value={address.id} />
            <input name="returnPath" type="hidden" value={returnPath} />
            <Button size="sm" type="submit" variant="ghost">
              Delete
            </Button>
          </form>
        </div>
      </div>
      <address className="mt-4 not-italic text-sm leading-6 text-muted-foreground">
        <span className="block font-medium text-foreground">
          {address.fullName}
        </span>
        <span className="block">{address.phone}</span>
        <span className="block">{address.addressLine1}</span>
        {address.addressLine2 ? (
          <span className="block">{address.addressLine2}</span>
        ) : null}
        {address.landmark ? (
          <span className="block">Landmark: {address.landmark}</span>
        ) : null}
        <span className="block">
          {address.city}, {address.district}
        </span>
        <span className="block">
          {address.state} - {address.postalCode}
        </span>
      </address>
    </article>
  );
}
