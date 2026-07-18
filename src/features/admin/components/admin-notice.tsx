const messages: Record<string, string> = {
  "asset-save-failed": "The uploaded asset could not be saved.",
  "delete-blocked": "This record is still referenced and cannot be deleted.",
  "delete-failed": "The record could not be deleted.",
  "image-delete-failed": "The product image could not be deleted.",
  "image-save-failed": "The product image could not be saved.",
  "invalid-banner": "Check the banner fields and try again.",
  "invalid-category": "Check the category fields and try again.",
  "invalid-image": "Check the product image fields and try again.",
  "invalid-order": "Check the order update fields and try again.",
  "invalid-product": "Check the product fields and try again.",
  "invalid-settings": "Check the settings fields and try again.",
  "invalid-upload": "Upload a JPEG, PNG, WebP, or SVG image under 5 MB.",
  "invalid-variant": "Check the variant fields and try again.",
  saved: "Changes saved.",
  "save-failed": "The changes could not be saved.",
  "toggle-failed": "The visibility change could not be saved.",
  "update-failed": "The order update could not be saved.",
  "upload-failed": "The image upload failed.",
  uploaded: "Upload complete.",
  "variant-save-failed": "The variant could not be saved.",
};

export function AdminNotice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const messageKey = error ?? success;
  if (!messageKey) return null;

  const isError = Boolean(error);
  const message =
    messages[messageKey] ?? (isError ? "Action failed." : "Done.");

  return (
    <p
      className={`mt-4 rounded-md border px-4 py-3 text-sm ${
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-primary"
      }`}
      role={isError ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
