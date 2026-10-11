import assert from "node:assert/strict";
import test from "node:test";

import { SALES_LIST_STATUSES } from "../src/lib/lead-stages";

test("offers reward statuses in the salesperson lead filter", () => {
  assert.equal(SALES_LIST_STATUSES.includes("Reward Eligible"), true);
  assert.equal(SALES_LIST_STATUSES.includes("Reward Paid"), true);
});
