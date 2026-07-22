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
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  address_line_1: string;
  city: string;
  district: string;
  state: string;
  country: string;
  zip_code: string;
  date_of_birth: string;
  nominee_name: string;
  relation_with_nominee: string;
  nominee_contact_no: string;
  anniversary_date: string;
}

interface PaymentHistory {
  date: string;
  amount?: number;
  points?: number;
  status: string;
}

export default IUser;
