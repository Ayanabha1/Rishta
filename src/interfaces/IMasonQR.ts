export interface IMasonQR {
  qrrewardsid: number;
  qrcode: string;
  available_days: number;
}

export interface IMasonQRResponse {
  success: boolean;
  data: {
    total: number;
    brands: string[];
    page: number;
    limit: number;
    records: IMasonQR[];
  };
}
