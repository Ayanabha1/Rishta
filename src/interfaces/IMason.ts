export interface IMason {
  contactid: number;
  firstname: string;
  lastname: string;
  mobile: string;
  status: string;
  earnings: string;
}

export interface IMasonListResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    records: IMason[];
  };
}
