<script lang="ts">
  import { AccountType } from "$lib/types/account-type";
  import NavBarItem from "./NavBarItem.svelte";

  interface Props {
    accountType: AccountType;
    accountColor: string;
  }

  let { accountType, accountColor }: Props = $props();
</script>

{#if accountType === AccountType.It}
  <div class="flex justify-center">
    <nav class="border-{accountColor} mt-5 border-2 rounded-full text-{accountColor} h-11 flex w-fit px-11 bg-white absolute">
      <NavBarItem pageName="Accounts" href="/accounts/" />
      <NavBarItem pageName="Faculty Records" href="/faculty-records/" />
    </nav>
  </div>
{/if}