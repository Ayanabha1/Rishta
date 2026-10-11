import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExtraSteelRequirementPayload,
  canRequestExtraSteel,
  isCurrentExtraSteelRequest,
  parseExtraSteelRequirementsResponse,
  validateExtraSteelRequirement,
} from "../src/lib/extra-steel";

test("allows only salespersons at Reward Eligible or Reward Paid", () => {
  assert.equal(canRequestExtraSteel("Salespersons", "Reward Eligible"), true);
  assert.equal(canRequestExtraSteel("Salespersons", "Reward Paid"), true);
  assert.equal(canRequestExtraSteel("Salespersons", "Sale Confirmed"), false);
  assert.equal(canRequestExtraSteel("Engineers", "Reward Eligible"), false);
});

test("rejects an async result that belongs to a previously viewed estimate", () => {
  assert.equal(isCurrentExtraSteelRequest("51270", "51270"), true);
  assert.equal(isCurrentExtraSteelRequest("51270", "51365"), false);
});

test("requires a positive extra-steel quantity", () => {
  assert.equal(
    validateExtraSteelRequirement({ extraSteelQty: "0", reason: "Need more" }),
    "Enter a quantity greater than 0"
  );
  assert.equal(
    validateExtraSteelRequirement({ extraSteelQty: "abc", reason: "Need more" }),
    "Enter a valid quantity"
  );
});

test("requires a reason and accepts a complete request", () => {
  assert.equal(
    validateExtraSteelRequirement({ extraSteelQty: "1.40", reason: "  " }),
    "Reason is required"
  );
  assert.equal(
    validateExtraSteelRequirement({
      extraSteelQty: "1.40",
      reason: "Need more",
    }),
    null
  );
});

test("builds the backend request with the documented field names", () => {
  assert.deepEqual(
    buildExtraSteelRequirementPayload(51270, {
      extraSteelQty: "1.40",
      reason: " Need more ",
    }),
    {
      siteestimateid: 51270,
      extra_steel_qty: "1.40",
      reason: "Need more",
    }
  );
});

test("normalizes the documented paginated requirements response", () => {
  const result = parseExtraSteelRequirementsResponse(
    {
      total: 30,
      page: 2,
      limit: 10,
      data: {
        siteestimateid: 51365,
        actual_steel_qty: 33.67,
        total_extra_steel_qty: 316,
        grand_total_steel_qty: 349.67,
        phase1_points: 50,
        phase2_points: 3367,
        total_points: 8917,
        entries: [
          {
            id: 27,
            extra_steel_qty: "1.00",
            reason: "Extra steel need more.",
            status: "Requested",
            points_awarded: 0,
            created_by: "Amit Das",
            created_at: "2026-10-07 07:33:41",
            modified_at: "2026-10-07 07:33:41",
          },
        ],
      },
    },
    51365,
    2,
    10
  );

  assert.equal(result.total, 30);
  assert.equal(result.page, 2);
  assert.equal(result.total_points, 8917);
  assert.equal(result.entries[0].id, 27);
});
