import assert from "node:assert/strict";
import test from "node:test";

let catalogue = {};

try {
  catalogue = await import("../src/lib/redeem-catalogue.mjs");
} catch {
  // The first TDD run intentionally happens before the implementation exists.
}

test("catalogue params include only API-supported filters", () => {
  assert.equal(
    typeof catalogue.buildRedeemCatalogueParams,
    "function",
    "catalogue query builder is not implemented"
  );

  const params = catalogue.buildRedeemCatalogueParams({
    category: "Home Appliance",
    featured: false,
    page: 2,
    limit: 20,
    id: "51317",
    status: "active",
  });

  assert.equal(
    params.toString(),
    "category=Home+Appliance&featured=false&page=2&limit=20"
  );
});

test("product links normalize bare domains and reject unsafe schemes", () => {
  assert.equal(
    typeof catalogue.toSafeExternalUrl,
    "function",
    "product link sanitizer is not implemented"
  );

  assert.equal(catalogue.toSafeExternalUrl("abc.com"), "https://abc.com/");
  assert.equal(
    catalogue.toSafeExternalUrl("https://example.com/item?id=1"),
    "https://example.com/item?id=1"
  );
  assert.equal(catalogue.toSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(catalogue.toSafeExternalUrl("ftp://example.com/file"), null);
  assert.equal(catalogue.toSafeExternalUrl("https://user:pass@example.com"), null);
  assert.equal(catalogue.toSafeExternalUrl("not a valid host"), null);
  assert.equal(catalogue.toSafeExternalUrl("  abc.com  "), "https://abc.com/");
  assert.equal(catalogue.toSafeExternalUrl("//example.com/item"), "https://example.com/item");
  assert.equal(catalogue.toSafeExternalUrl(null), null);
});

test("catalogue dates support date-only and full ISO API values", () => {
  assert.equal(
    typeof catalogue.formatCatalogueDate,
    "function",
    "catalogue date formatter is not implemented"
  );

  assert.equal(catalogue.formatCatalogueDate("2026-10-01", "en-GB"), "1 Oct 2026");
  assert.equal(
    catalogue.formatCatalogueDate("2026-10-01T12:30:00Z", "en-GB"),
    "1 Oct 2026"
  );
  assert.equal(catalogue.formatCatalogueDate("not-a-date", "en-GB"), null);
  assert.equal(catalogue.formatCatalogueDate(null, "en-GB"), null);
});
