interface IEstimate {
  siteestimateid: number;
  siteestimate_no: string;
  customer_name: string;
  pincode: string;
  lead_status: string;
  salesperson_name: string;
}

interface IFileInfo {
  id: string;
  title: string;
}

interface IEstimateDetail {
  siteestimateid: number;
  siteestimate_no: string;
  lead_status: string;
  linked_customer_id: number;
  assigned_engineer_id: number;
  assigned_salesperson_id: number;
  assigned_dealer_id: number;
  customer_name: string;
  mobile_number: string;
  alternate_number: string;
  customer_type: string;
  site_address: string;
  pincode: string;
  city: string;
  project_type: string;
  construction_stage: string;
  approx_steel_qty: string;
  purchase_timeline: string;
  product_interest: string;
  competitor_brand: string;
  engineer_notes: string;
  opportunity_temperature: string;
  conversion_probability: number;
  actual_steel_qty: string;
  visit_date: string | null;
  visit_notes: string;
  followup_date: string | null;
  quotation_status: string;
  dealer_remarks: string;
  lost_reason: string;
  lost_reason_notes: string;
  original_engineer_name: string | null;
  original_estimate_snapshot: string | null;
  salesperson_name: string;
  list_of_files?: IFileInfo[];
}

export default IEstimate;
export type { IEstimateDetail, IFileInfo };