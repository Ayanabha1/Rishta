// Salesperson lead workflow. Mirrors the backend rules on
// POST /updateSiteEstimate and GET /getMySiteEstimates.

export const LOST = "Lost";

// A salesperson moves a lead forward one step, or sideways to Lost.
export const NEXT_STATUS: Record<string, string[]> = {
  Assigned: ["Contacted", LOST],
  Contacted: ["Visited", LOST],
  Visited: ["Estimate Validated", LOST],
  "Estimate Validated": ["Quotation Shared", LOST],
  "Quotation Shared": ["Dealer Mapped", LOST],
  "Dealer Mapped": ["Sale Confirmed", LOST],
  "Sale Confirmed": [],
};

// Statuses a salesperson may request on the list endpoint. Anything else
// (New, Lost, Invoice Generated, Reward Eligible, Reward Paid) is a 403.
export const SALES_LIST_STATUSES = [
  "Assigned",
  "Contacted",
  "Visited",
  "Estimate Validated",
  "Quotation Shared",
  "Dealer Mapped",
  "Sale Confirmed",
];

// The forward pipeline, in order. Lost is a side exit, not a stage.
export const STAGE_ORDER = SALES_LIST_STATUSES;

export const stageIndex = (status: string) => STAGE_ORDER.indexOf(status);

// Tailwind classes for a status pill, by stage tone.
export const statusPillClass = (status: string): string => {
  if (status === LOST) return "bg-red-500 text-white";
  if (status === "Sale Confirmed") return "bg-emerald-600 text-white";
  const index = stageIndex(status);
  if (index < 0) return "bg-gray-400 text-white";
  if (index === 0) return "bg-amber-500 text-white";
  return "bg-purple-600 text-white";
};

export const OPPORTUNITY_TEMPERATURES = ["Hot", "Warm", "Cold"];

export const TEMPERATURE_PILL_CLASS: Record<string, string> = {
  Hot: "bg-red-100 text-red-800",
  Warm: "bg-amber-100 text-amber-800",
  Cold: "bg-sky-100 text-sky-800",
};

export const QUOTATION_STATUSES = [
  "Not Shared",
  "Shared",
  "Under Discussion",
  "Finalised",
];

// A quotation only exists from Quotation Shared onward, so the optional
// quotation_status field is offered from that stage on.
export const QUOTATION_STAGES = [
  "Quotation Shared",
  "Dealer Mapped",
  "Sale Confirmed",
];

export const LOST_REASONS = [
  "Price Too High",
  "Competitor Selected",
  "Project Cancelled",
  "Customer Unresponsive",
  "Requirement Changed",
  "Other",
];

// Every forward stage requires a follow-up and visit notes.
const FOLLOWUP_STAGES = [
  "Contacted",
  "Visited",
  "Estimate Validated",
  "Quotation Shared",
  "Dealer Mapped",
  "Sale Confirmed",
];

export const needsFollowup = (status: string) =>
  FOLLOWUP_STAGES.includes(status);

export const getNextStatuses = (current: string): string[] =>
  NEXT_STATUS[current] || [];

// Today's date in Asia/Kolkata as YYYY-MM-DD.
export const istToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Current time in Asia/Kolkata as HH:MM (24-hour).
export const istNowTime = (): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

// "2026-09-02" -> "2 Sep 2026". Returns "" for empty/unparseable input.
export const formatDate = (value?: string | null): string => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

// "14:38:00" -> "2:38 PM".
export const formatTime = (value?: string | null): string => {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const h = Number(hours);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${minutes ?? "00"} ${suffix}`;
};

// Follow-up date and time as one line.
export const formatFollowup = (
  date?: string | null,
  time?: string | null
): string => {
  const d = formatDate(date);
  if (!d) return "";
  const t = formatTime(time);
  return t ? `${d}, ${t}` : d;
};

/**
 * Returns the fields the backend requires for a given target status,
 * beyond `id` and `lead_status`.
 */
export const requiredFieldsFor = (status: string): string[] => {
  if (!status) return [];
  if (status === LOST) return ["lost_reason", "lost_reason_notes"];

  const fields: string[] = [];
  if (needsFollowup(status)) {
    fields.push("followup_date", "followup_time", "visit_notes");
  }
  if (status === "Visited") {
    fields.push(
      "opportunity_temperature",
      "conversion_probability",
      "actual_steel_qty"
    );
  }
  if (status === "Dealer Mapped") fields.push("dealer_id");
  if (status === "Sale Confirmed") fields.push("invoice_uploaded");
  return fields;
};
