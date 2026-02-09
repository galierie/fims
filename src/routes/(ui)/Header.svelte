<script lang="ts">
  import { AccountType } from "$lib/types/account-type";
  import LogOutButton from "./LogOutButton.svelte";

  interface Props {
    accountType: AccountType;
    accountColor: string;
    email: string;
  }

  let { accountType, accountColor, email }: Props = $props();
</script>

<header class="flex items-center justify-between h-14 w-full px-6 bg-white">
  <div>
    <span class="text-fims-green font-semibold">Faculty Information Management System</span>
  </div>
  <div>
    <span class="text-{accountColor} pr-3 font-semibold">{email}</span>
    <LogOutButton />
  </div>
</header>