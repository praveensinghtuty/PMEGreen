"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  dryRunCatalogImportAction,
  executeCatalogImportAction,
  type ImportActionState,
} from "@/features/admin/import/import-actions";

const initialState: ImportActionState = {};

export function CatalogImportForm() {
  const [csv, setCsv] = useState("");
  const [defaultCategoryName, setDefaultCategoryName] = useState("");
  const [dryRunState, dryRunAction] = useActionState(
    dryRunCatalogImportAction,
    initialState,
  );
  const [importState, importAction] = useActionState(
    executeCatalogImportAction,
    initialState,
  );
  const state = importState.report ? importState : dryRunState;
  const canImport = Boolean(
    dryRunState.report && dryRunState.report.errors.length === 0,
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Upload catalog CSV</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use dry-run first. The confirmed import uses the same validation and
          writes through an atomic admin database function.
        </p>

        <label className="mt-5 grid gap-2 text-sm font-medium">
          CSV file
          <input
            accept=".csv,text/csv"
            className="rounded-md border border-input bg-background px-3 py-2"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              if (file.size > 1024 * 1024) {
                setCsv("");
                return;
              }
              setCsv(await file.text());
            }}
            type="file"
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-medium">
          Default category name
          <input
            className="h-11 rounded-md border border-input bg-background px-3"
            form="catalog-import-dry-run"
            name="defaultCategoryName"
            onChange={(event) =>
              setDefaultCategoryName(event.currentTarget.value)
            }
            placeholder="Optional category for files without a category column"
            value={defaultCategoryName}
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-medium">
          CSV content
          <textarea
            className="min-h-72 rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            name="csv"
            onChange={(event) => setCsv(event.currentTarget.value)}
            value={csv}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <form action={dryRunAction} id="catalog-import-dry-run">
            <input name="csv" type="hidden" value={csv} />
            <PendingButton>Dry run</PendingButton>
          </form>
          <form action={importAction}>
            <input name="csv" type="hidden" value={csv} />
            <input
              name="defaultCategoryName"
              type="hidden"
              value={defaultCategoryName}
            />
            <PendingButton disabled={!canImport} variant="outline">
              Confirm import
            </PendingButton>
          </form>
        </div>
      </section>

      <ImportReport state={state} />
    </div>
  );
}

function ImportReport({ state }: { state: ImportActionState }) {
  const report = state.report;

  return (
    <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Import report</h2>
      {state.message ? (
        <p
          className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-sm"
          role={report?.errors.length ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      {!report ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Run a dry-run to see products, variants, category changes, warnings,
          and row-level errors.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 text-sm">
          <ReportMetric
            label="Products to create"
            value={report.productsToCreate}
          />
          <ReportMetric
            label="Variants to create"
            value={report.variantsToCreate}
          />
          <ReportMetric
            label="Categories to create"
            value={report.categoriesToCreate.length}
          />
          <ReportMetric
            label="Images referenced"
            value={report.imagesReferenced.length}
          />
          <ReportMetric
            label="Duplicate rows"
            value={report.duplicateRows.length}
          />
          <IssueList title="Errors" issues={report.errors} />
          <IssueList title="Warnings" issues={report.warnings} />
          <details className="rounded-md border border-border p-3">
            <summary className="cursor-pointer font-medium">Products</summary>
            <ul className="mt-2 grid gap-2">
              {report.products.map((product) => (
                <li key={product.slug}>
                  {product.name} ({product.variants.length} variants)
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </aside>
  );
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IssueList({
  issues,
  title,
}: {
  issues: { code: string; message: string; row?: number }[];
  title: string;
}) {
  return (
    <details
      className="rounded-md border border-border p-3"
      open={issues.length > 0}
    >
      <summary className="cursor-pointer font-medium">
        {title} ({issues.length})
      </summary>
      {issues.length === 0 ? (
        <p className="mt-2 text-muted-foreground">None.</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {issues.slice(0, 25).map((issue, index) => (
            <li key={`${issue.code}-${issue.row ?? index}`}>
              {issue.row ? `Row ${issue.row}: ` : ""}
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function PendingButton({
  children,
  disabled,
  variant,
}: {
  children: string;
  disabled?: boolean;
  variant?: "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled || pending} type="submit" variant={variant}>
      {pending ? "Working..." : children}
    </Button>
  );
}
