interface IUser {
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
  "12monthearing": string;
  latest10paymenthistory: PaymentHistory[];
  latest10pointhistory: PaymentHistory[];
  accounttype: string;
  accountname: string;
  owner_name: string;
}

interface PaymentHistory {
  date: string;
  amount?: number;
  points?: number;
  status: string;
}

export default IUser;
