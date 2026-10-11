export interface ExtraSteelRequirementForm {
  extraSteelQty: string;
  reason: string;
}

export interface ExtraSteelRequirementEntry {
  id: number;
  extra_steel_qty: string;
  reason: string;
  status: string;
  points_awarded: number;
  created_by: string;
  created_at: string;
  modified_at: string;
}

export interface ExtraSteelRequirementPage {
  total: number;
  page: number;
  limit: number;
  siteestimateid: number;
  actual_steel_qty: number;
  total_extra_steel_qty: number;
  grand_total_steel_qty: number;
  phase1_points: number;
  phase2_points: number;
  total_points: number;
  entries: ExtraSteelRequirementEntry[];
}

export const canRequestExtraSteel = (module: string, leadStatus: string) =>
  module === "Salespersons" &&
  (leadStatus === "Reward Eligible" || leadStatus === "Reward Paid");

export const isCurrentExtraSteelRequest = (
  requestedEstimateId: string,
  currentEstimateId: string
) => requestedEstimateId === currentEstimateId;

export const validateExtraSteelRequirement = ({
  extraSteelQty,
  reason,
}: ExtraSteelRequirementForm): string | null => {
  const quantity = Number(extraSteelQty);

  if (!extraSteelQty.trim() || !Number.isFinite(quantity)) {
    return "Enter a valid quantity";
  }
  if (quantity <= 0) {
    return "Enter a quantity greater than 0";
  }
  if (!reason.trim()) {
    return "Reason is required";
  }

  return null;
};

export const buildExtraSteelRequirementPayload = (
  siteEstimateId: number,
  { extraSteelQty, reason }: ExtraSteelRequirementForm
) => ({
  siteestimateid: siteEstimateId,
  extra_steel_qty: extraSteelQty.trim(),
  reason: reason.trim(),
});

export const parseExtraSteelRequirementsResponse = (
  result: any,
  siteEstimateId: number,
  requestedPage: number,
  pageSize: number
): ExtraSteelRequirementPage => {
  const details = result?.data;

  return {
    total: Number(result?.total) || 0,
    page: Number(result?.page) || requestedPage,
    limit: Number(result?.limit) || pageSize,
    siteestimateid: Number(details?.siteestimateid) || siteEstimateId,
    actual_steel_qty: Number(details?.actual_steel_qty) || 0,
    total_extra_steel_qty: Number(details?.total_extra_steel_qty) || 0,
    grand_total_steel_qty: Number(details?.grand_total_steel_qty) || 0,
    phase1_points: Number(details?.phase1_points) || 0,
    phase2_points: Number(details?.phase2_points) || 0,
    total_points: Number(details?.total_points) || 0,
    entries: Array.isArray(details?.entries) ? details.entries : [],
  };
};
