import { StoreShell } from "@/components/layout/store-shell";
import { signOut } from "@/features/auth/actions/sign-out";
import { requireUser } from "@/features/auth/queries/current-user";

export const metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <StoreShell>
      <main className="mx-auto min-h-[calc(100svh-8rem)] max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Customer account</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          You are signed in through Supabase Auth. Profile, address, wishlist,
          cart, and order features continue in later phases.
        </p>
        <dl className="mt-6 rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
          <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
            <dt className="font-medium text-muted-foreground">User ID</dt>
            <dd className="break-all">{user.id}</dd>
          </div>
          <div className="mt-4 grid gap-1 sm:grid-cols-[8rem_1fr]">
            <dt className="font-medium text-muted-foreground">Email</dt>
            <dd>{user.email ?? "Not provided"}</dd>
          </div>
          <div className="mt-4 grid gap-1 sm:grid-cols-[8rem_1fr]">
            <dt className="font-medium text-muted-foreground">Phone</dt>
            <dd>{user.phone ?? "Not provided"}</dd>
          </div>
        </dl>
        <form action={signOut} className="mt-6">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </main>
    </StoreShell>
  );
}
