export type CatalogImportColumn =
  | "category_name"
  | "category_slug"
  | "image_filename"
  | "is_bestseller"
  | "is_featured"
  | "price"
  | "product_name"
  | "product_slug"
  | "sku"
  | "status"
  | "stock_quantity"
  | "variant_name";

export type CatalogImportSeverity = "error" | "warning";

export type CatalogImportIssue = {
  code: string;
  message: string;
  row?: number;
  severity: CatalogImportSeverity;
};

export type CatalogImportRow = {
  categoryName: string;
  categorySlug: string;
  imageFilename: null | string;
  isBestseller: boolean;
  isFeatured: boolean;
  price: number;
  productName: string;
  productSlug: string;
  sku: null | string;
  status: "active" | "draft" | "inactive";
  stockQuantity: number;
  variantName: string;
};

export type CatalogImportProduct = {
  categorySlug: string;
  images: string[];
  isBestseller: boolean;
  isFeatured: boolean;
  name: string;
  slug: string;
  status: "active" | "draft" | "inactive";
  variants: CatalogImportVariant[];
};

export type CatalogImportVariant = {
  isDefault: boolean;
  name: string;
  price: number;
  sku: null | string;
  stockQuantity: number;
};

export type CatalogImportPlan = {
  categoriesToCreate: { name: string; slug: string }[];
  duplicateRows: number[];
  errors: CatalogImportIssue[];
  imagesReferenced: string[];
  products: CatalogImportProduct[];
  productsToCreate: number;
  rows: CatalogImportRow[];
  skippedRows: number[];
  variantsToCreate: number;
  warnings: CatalogImportIssue[];
};

export type CatalogImportContext = {
  defaultCategoryName?: string;
  existingCategorySlugs?: Set<string>;
  existingProductSlugs?: Set<string>;
  existingSkus?: Set<string>;
  imageFilenames?: Set<string>;
};

const columnAliases: Record<string, CatalogImportColumn> = {
  category: "category_name",
  category_name: "category_name",
  category_slug: "category_slug",
  image: "image_filename",
  image_filename: "image_filename",
  is_bestseller: "is_bestseller",
  is_featured: "is_featured",
  name: "product_name",
  price: "price",
  prices: "price",
  product: "product_name",
  product_name: "product_name",
  product_slug: "product_slug",
  products: "product_name",
  prodoucts: "product_name",
  quantity: "variant_name",
  size: "variant_name",
  sku: "sku",
  status: "status",
  stock: "stock_quantity",
  stock_quantity: "stock_quantity",
  variant: "variant_name",
  variant_name: "variant_name",
};

const requiredColumns = new Set<CatalogImportColumn>([
  "product_name",
  "variant_name",
  "price",
]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern =
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

export function parseCatalogCsv(csv: string) {
  const rows = parseCsvRows(stripUtf8Bom(csv)).filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );
  const errors: CatalogImportIssue[] = [];

  if (rows.length === 0) {
    return { errors: [issue("empty-csv", "CSV file is empty.")], rows: [] };
  }

  const headerCells = rows[0].map((cell) => normalizeHeader(cell));
  const columns: CatalogImportColumn[] = [];
  const seenColumns = new Set<CatalogImportColumn>();

  headerCells.forEach((header, index) => {
    const column = columnAliases[header];
    if (!column) {
      errors.push(
        issue(
          "unknown-column",
          `Unknown column "${rows[0][index].trim()}" is not supported.`,
          1,
        ),
      );
      return;
    }
    if (seenColumns.has(column)) {
      errors.push(
        issue("duplicate-column", `Duplicate column "${column}".`, 1),
      );
    }
    seenColumns.add(column);
    columns[index] = column;
  });

  for (const required of requiredColumns) {
    if (!seenColumns.has(required)) {
      errors.push(
        issue("missing-column", `Missing required column "${required}".`, 1),
      );
    }
  }

  if (errors.length > 0) return { errors, rows: [] };

  return {
    errors,
    rows: rows.slice(1).map((row, rowIndex) => {
      const record: Partial<Record<CatalogImportColumn, string>> = {};
      columns.forEach((column, index) => {
        record[column] = row[index]?.trim() ?? "";
      });
      return { record, rowNumber: rowIndex + 2 };
    }),
  };
}

export function buildCatalogImportPlan(
  csv: string,
  context: CatalogImportContext = {},
): CatalogImportPlan {
  const parsed = parseCatalogCsv(csv);
  const warnings: CatalogImportIssue[] = [];
  const errors = [...parsed.errors];
  const rows: CatalogImportRow[] = [];
  const duplicateRows: number[] = [];
  const skippedRows: number[] = [];
  const rowKeys = new Set<string>();
  const fileSkus = new Set<string>();
  const fileProductSlugs = new Map<string, string>();
  const fileProductNames = new Map<string, string>();

  for (const parsedRow of parsed.rows) {
    for (const rawSku of splitMultiValue(parsedRow.record.sku)) {
      if (fileSkus.has(rawSku)) {
        errors.push(
          issue(
            "duplicate-sku",
            `Duplicate SKU "${rawSku}" in import file.`,
            parsedRow.rowNumber,
          ),
        );
      }
      fileSkus.add(rawSku);
    }

    const normalizedRows = normalizeRecord(
      parsedRow.record,
      parsedRow.rowNumber,
      {
        ...context,
        warnings,
      },
    );

    for (const normalized of normalizedRows.rows) {
      const rowKey = `${normalized.productSlug}:${normalized.sku ?? normalized.variantName.toLowerCase()}`;
      if (rowKeys.has(rowKey)) {
        duplicateRows.push(parsedRow.rowNumber);
        errors.push(
          issue(
            "duplicate-row",
            `Duplicate product/variant row for ${normalized.productSlug}.`,
            parsedRow.rowNumber,
          ),
        );
        continue;
      }
      rowKeys.add(rowKey);

      const existingNameForSlug = fileProductSlugs.get(normalized.productSlug);
      if (
        existingNameForSlug &&
        existingNameForSlug !== normalized.productName
      ) {
        errors.push(
          issue(
            "duplicate-slug",
            `Product slug "${normalized.productSlug}" maps to multiple product names.`,
            parsedRow.rowNumber,
          ),
        );
      }
      fileProductSlugs.set(normalized.productSlug, normalized.productName);

      const existingSlugForName = fileProductNames.get(
        normalized.productName.toLowerCase(),
      );
      if (
        existingSlugForName &&
        existingSlugForName !== normalized.productSlug
      ) {
        errors.push(
          issue(
            "duplicate-product-name",
            `Product name "${normalized.productName}" maps to multiple slugs.`,
            parsedRow.rowNumber,
          ),
        );
      }
      fileProductNames.set(
        normalized.productName.toLowerCase(),
        normalized.productSlug,
      );
      rows.push(normalized);
    }

    errors.push(...normalizedRows.errors);
  }

  const categoryMap = new Map<string, { name: string; slug: string }>();
  const productMap = new Map<string, CatalogImportProduct>();
  const images = new Set<string>();

  for (const row of rows) {
    if (!context.existingCategorySlugs?.has(row.categorySlug)) {
      categoryMap.set(row.categorySlug, {
        name: row.categoryName,
        slug: row.categorySlug,
      });
    }

    const product = productMap.get(row.productSlug) ?? {
      categorySlug: row.categorySlug,
      images: [],
      isBestseller: row.isBestseller,
      isFeatured: row.isFeatured,
      name: row.productName,
      slug: row.productSlug,
      status: row.status,
      variants: [],
    };

    if (row.imageFilename && !product.images.includes(row.imageFilename)) {
      product.images.push(row.imageFilename);
      images.add(row.imageFilename);
    }

    product.variants.push({
      isDefault: product.variants.length === 0,
      name: row.variantName,
      price: row.price,
      sku: row.sku,
      stockQuantity: row.stockQuantity,
    });
    productMap.set(row.productSlug, product);
  }

  const products = [...productMap.values()];
  const productsToCreate = products.filter(
    (product) => !context.existingProductSlugs?.has(product.slug),
  ).length;
  const variantsToCreate = products.reduce(
    (total, product) =>
      total +
      product.variants.filter(
        (variant) => !variant.sku || !context.existingSkus?.has(variant.sku),
      ).length,
    0,
  );

  return {
    categoriesToCreate: [...categoryMap.values()],
    duplicateRows,
    errors,
    imagesReferenced: [...images],
    products,
    productsToCreate,
    rows,
    skippedRows,
    variantsToCreate,
    warnings,
  };
}

export function planToRpcPayload(plan: CatalogImportPlan) {
  if (plan.errors.length > 0) {
    throw new Error("Cannot create an import payload from an invalid plan.");
  }

  return {
    categories: plan.categoriesToCreate,
    products: plan.products.map((product) => ({
      category_slug: product.categorySlug,
      images: product.images,
      is_bestseller: product.isBestseller,
      is_featured: product.isFeatured,
      name: product.name,
      slug: product.slug,
      status: product.status,
      variants: product.variants.map((variant) => ({
        is_default: variant.isDefault,
        name: variant.name,
        price: variant.price,
        sku: variant.sku,
        stock_quantity: variant.stockQuantity,
      })),
    })),
  };
}

function normalizeRecord(
  record: Partial<Record<CatalogImportColumn, string>>,
  rowNumber: number,
  context: CatalogImportContext & { warnings: CatalogImportIssue[] },
) {
  const errors: CatalogImportIssue[] = [];
  const productName = requiredText(
    record.product_name,
    "product name",
    rowNumber,
    errors,
  );
  const categoryName =
    clean(record.category_name) ?? clean(context.defaultCategoryName);
  const productSlug = clean(record.product_slug) ?? slugify(productName);
  const categorySlug =
    clean(record.category_slug) ?? slugify(categoryName ?? "");
  const imageFilename = clean(record.image_filename);
  const status = parseStatus(record.status, rowNumber, errors);
  const isFeatured = parseBoolean(
    record.is_featured,
    rowNumber,
    "is_featured",
    errors,
  );
  const isBestseller = parseBoolean(
    record.is_bestseller,
    rowNumber,
    "is_bestseller",
    errors,
  );
  const stockQuantity = parseInteger(
    record.stock_quantity,
    rowNumber,
    "stock_quantity",
    errors,
  );

  if (!categoryName) {
    errors.push(
      issue(
        "missing-category",
        "Category is required. Add category_name or provide a default category for the import.",
        rowNumber,
      ),
    );
  }
  if (!productSlug || !slugPattern.test(productSlug)) {
    errors.push(
      issue("invalid-product-slug", "Product slug is invalid.", rowNumber),
    );
  }
  if (!categorySlug || !slugPattern.test(categorySlug)) {
    errors.push(
      issue("invalid-category-slug", "Category slug is invalid.", rowNumber),
    );
  }
  if (imageFilename) {
    if (!imagePattern.test(imageFilename)) {
      errors.push(
        issue(
          "invalid-image",
          `Image filename "${imageFilename}" is invalid.`,
          rowNumber,
        ),
      );
    } else if (
      context.imageFilenames &&
      !context.imageFilenames.has(imageFilename.toLowerCase())
    ) {
      errors.push(
        issue(
          "missing-image",
          `Image filename "${imageFilename}" was not found in the import image folder.`,
          rowNumber,
        ),
      );
    }
  }

  const variantNames = splitMultiValue(record.variant_name);
  const prices = splitMultiValue(record.price);
  const skus = splitMultiValue(record.sku);
  if (variantNames.length !== prices.length) {
    errors.push(
      issue(
        "variant-price-mismatch",
        "Variant and price counts must match.",
        rowNumber,
      ),
    );
  }

  const maxRows = Math.max(variantNames.length, prices.length);
  const rows: CatalogImportRow[] = [];
  for (let index = 0; index < maxRows; index += 1) {
    const variantName = requiredText(
      variantNames[index],
      "variant name",
      rowNumber,
      errors,
    );
    const price = parsePrice(prices[index], rowNumber, errors);
    const sku = clean(skus[index]);

    if (sku && context.existingSkus?.has(sku)) {
      context.warnings.push(
        warning(
          "existing-sku",
          `SKU "${sku}" already exists and will be skipped by an idempotent import.`,
          rowNumber,
        ),
      );
    }

    if (productName && categoryName && variantName && price !== null) {
      rows.push({
        categoryName,
        categorySlug,
        imageFilename,
        isBestseller,
        isFeatured,
        price,
        productName,
        productSlug,
        sku,
        status,
        stockQuantity,
        variantName,
      });
    }
  }

  return { errors, rows };
}

function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  rows.push(row);
  return rows;
}

function splitMultiValue(value: string | undefined) {
  const cleaned = clean(value);
  if (!cleaned) return [];
  return cleaned
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePrice(
  value: string | undefined,
  rowNumber: number,
  errors: CatalogImportIssue[],
) {
  const cleaned = clean(value)?.replace(/[₹,\s]/g, "");
  const price = cleaned ? Number(cleaned) : Number.NaN;
  if (!Number.isFinite(price) || price < 0) {
    errors.push(
      issue("invalid-price", "Price must be a non-negative number.", rowNumber),
    );
    return null;
  }
  return Math.round(price * 100) / 100;
}

function parseInteger(
  value: string | undefined,
  rowNumber: number,
  field: string,
  errors: CatalogImportIssue[],
) {
  const cleaned = clean(value);
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isInteger(parsed) || parsed < 0) {
    errors.push(
      issue(
        "invalid-stock",
        `${field} must be a non-negative integer.`,
        rowNumber,
      ),
    );
    return 0;
  }
  return parsed;
}

function parseStatus(
  value: string | undefined,
  rowNumber: number,
  errors: CatalogImportIssue[],
) {
  const cleaned = clean(value);
  if (!cleaned) return "draft";
  if (cleaned === "active" || cleaned === "draft" || cleaned === "inactive") {
    return cleaned;
  }
  errors.push(
    issue(
      "invalid-status",
      "Status must be draft, active, or inactive.",
      rowNumber,
    ),
  );
  return "draft";
}

function parseBoolean(
  value: string | undefined,
  rowNumber: number,
  field: string,
  errors: CatalogImportIssue[],
) {
  const cleaned = clean(value)?.toLowerCase();
  if (!cleaned) return false;
  if (["1", "true", "yes", "y"].includes(cleaned)) return true;
  if (["0", "false", "no", "n"].includes(cleaned)) return false;
  errors.push(
    issue("invalid-boolean", `${field} must be true or false.`, rowNumber),
  );
  return false;
}

function requiredText(
  value: string | undefined,
  field: string,
  rowNumber: number,
  errors: CatalogImportIssue[],
) {
  const cleaned = clean(value);
  if (!cleaned) {
    errors.push(issue("missing-required", `Missing ${field}.`, rowNumber));
    return "";
  }
  return cleaned;
}

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function clean(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripUtf8Bom(value: string) {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function issue(
  code: string,
  message: string,
  row?: number,
): CatalogImportIssue {
  return { code, message, row, severity: "error" };
}

function warning(
  code: string,
  message: string,
  row?: number,
): CatalogImportIssue {
  return { code, message, row, severity: "warning" };
}
