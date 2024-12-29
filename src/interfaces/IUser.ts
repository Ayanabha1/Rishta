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
}

interface PaymentHistory {
  date: string;
  amount: number;
  status: string;
}

export default IUser;
