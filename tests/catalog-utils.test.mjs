import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath) {
  const filename = path.resolve(relativePath);
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  const localRequire = createRequire(filename);
  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output,
  );

  fn(
    compiledModule.exports,
    localRequire,
    compiledModule,
    filename,
    path.dirname(filename),
  );

  return compiledModule.exports;
}

const params = loadTypeScriptModule("src/features/catalog/utils/params.ts");
const format = loadTypeScriptModule("src/features/catalog/utils/format.ts");

test("parseSlug accepts clean storefront slugs only", () => {
  assert.equal(params.parseSlug("cold-pressed-oil").success, true);
  assert.equal(params.parseSlug("bad slug").success, false);
  assert.equal(params.parseSlug("../admin").success, false);
});

test("parseCatalogSearchParams normalizes unsafe or unsupported values", () => {
  assert.deepEqual(
    params.parseCatalogSearchParams({
      category: "valid-category",
      page: "2",
      q: "  oil  ",
      sort: "price-asc",
    }),
    {
      category: "valid-category",
      page: 2,
      query: "oil",
      sort: "price-asc",
    },
  );

  assert.deepEqual(
    params.parseCatalogSearchParams({
      category: "bad category",
      page: "-1",
      q: "x".repeat(120),
      sort: "unknown",
    }),
    {
      category: undefined,
      page: 1,
      query: undefined,
      sort: "featured",
    },
  );
});

test("buildCatalogHref keeps default params out of clean storefront URLs", () => {
  assert.equal(params.buildCatalogHref({ sort: "featured" }), "/shop");
  assert.equal(
    params.buildCatalogHref({
      category: "oils",
      page: 3,
      query: "gingelly oil",
      sort: "price-desc",
    }),
    "/shop?category=oils&q=gingelly+oil&sort=price-desc&page=3",
  );
});

test("catalog formatting renders prices and variant labels safely", () => {
  assert.equal(format.formatMoney(125), "₹125");
  assert.equal(
    format.formatVariantMeasure({
      id: "1",
      name: "Default",
      price: 125,
      compareAtPrice: null,
      stockQuantity: 1,
      trackInventory: true,
      isDefault: true,
      value: 500,
      unit: "ml",
    }),
    "500 ml",
  );
});

test("variant availability follows active storefront stock rules", () => {
  assert.equal(
    format.isVariantAvailable({
      id: "1",
      name: "Tracked",
      price: 100,
      compareAtPrice: null,
      stockQuantity: 0,
      trackInventory: true,
      isDefault: false,
      value: null,
      unit: null,
    }),
    false,
  );
  assert.equal(
    format.isVariantAvailable({
      id: "2",
      name: "Untracked",
      price: 100,
      compareAtPrice: null,
      stockQuantity: 0,
      trackInventory: false,
      isDefault: false,
      value: null,
      unit: null,
    }),
    true,
  );
});
