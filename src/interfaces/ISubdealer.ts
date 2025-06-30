export interface ISubdealer {
  accountid: number;
  accountname: string;
}

export interface ISubdealerSearchResponse {
  success: boolean;
  data: ISubdealer[];
}
