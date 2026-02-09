import { AccountType } from '$lib/types/account-type';

export async function load() {
  const accountColorMap = new Map();
  accountColorMap.set(AccountType.Admin, "fims-green");
  accountColorMap.set(AccountType.It, "fims-red");

  // TODO: Check which email is logged in and its account type
  const accountType = AccountType.Admin;

  return {
    accountType,
    accountColor: accountColorMap.get(accountType),
    email: "email@up.edu.ph",
  };
}