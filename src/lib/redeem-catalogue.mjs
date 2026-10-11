const SUPPORTED_FILTERS = ["category", "featured", "page", "limit"];

export function buildRedeemCatalogueParams(filters = {}) {
  const params = new URLSearchParams();

  for (const key of SUPPORTED_FILTERS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return params;
}

export function toSafeExternalUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const trimmed = value.trim();
    if (!trimmed || (/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed))) {
      return null;
    }

    const candidate = trimmed.startsWith("//")
      ? `https:${trimmed}`
      : /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    const url = new URL(candidate);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function formatCatalogueDate(value, locale = "en-IN") {
  if (!value || typeof value !== "string") return null;

  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
