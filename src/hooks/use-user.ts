import { create } from "zustand";

export interface IUserDetails {
  id: string;
  username: string;
  status: string;
  email: string;
  phoneNumber: string;
  address: string;
  accountBalance: number;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export const useUserStore = create<IUserDetails>((set) => ({
  id: "",
  username: "",
  status: "",
  email: "",
  phoneNumber: "",
  address: "",
  accountBalance: 0,
  accountNumber: "",
  bankName: "",
  bankCode: "",
  updateUserDetails: (data: IUserDetails) =>
    set((state) => ({ ...state, ...data })),
}));
