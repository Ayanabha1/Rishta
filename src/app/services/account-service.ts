const mockAccounts: any[] = [
  { accountname: "Super Steel", accountid: 490 },
  { accountname: "Mega Manufacturing", accountid: 491 },
  { accountname: "Tech Solutions", accountid: 492 },
  { accountname: "Global Trading", accountid: 493 },
  { accountname: "Prime Industries", accountid: 494 },
];

export const searchAccounts = async (query: string): Promise<any[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockAccounts.filter((account) =>
    account.accountname.toLowerCase().includes(query.toLowerCase())
  );
};
