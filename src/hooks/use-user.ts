import { create } from "zustand";

export interface IUserDetails {
  module: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  address: string;
  salesofficername: string;
  accountholdername: string;
  bankaccountnumber: string;
  ifsccode: string;
  bankname: string;
  status: string;
  "12monthearing": number;
  latest10paymenthistory: any[];
  accounttype: string;
  accountname: string;
  owner_name: string;
}

export const useUserStore = create<IUserDetails>((set) => ({
  module: "Contacts",
  firstname: "Rimba",
  lastname: "Mishra",
  email: "rimab@example.com",
  mobile: "8918829811",
  address: "4545 Main Street",
  salesofficername: "Rajib Singa",
  accountholdername: "Sunia Chouhan",
  bankaccountnumber: "145456564646464",
  ifsccode: "SBIN000045",
  bankname: "United Bank Of India",
  status: "Pending for Approval",
  "12monthearing": 150,
  latest10paymenthistory: [],
  accounttype: "",
  accountname: "",
  owner_name: "",
  updateUserDetails: (data: Partial<IUserDetails>) =>
    set((state) => ({ ...state, ...data })),
}));
