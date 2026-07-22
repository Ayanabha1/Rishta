interface IEstimate {
  customer_name: string;
  mobile_number: string;
  customer_type: string;
  site_address: string;
  pincode: string;
  city: string;
  state: string;
  project_type: string;
  construction_stage: string;
  approx_steel_qty: string;
  purchase_timeline: string;
  product_interest: string;
  competitor_brand: string;
  status?: string;
  createdon?: string;
}

export default IEstimate;
