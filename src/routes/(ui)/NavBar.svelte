<script lang="ts">
  import NavBarItem from "./NavBarItem.svelte";

  interface Props {
    canViewAccounts: boolean;
    accountColor: string;
  }

  let { canViewAccounts, accountColor }: Props = $props();
</script>

{#if canViewAccounts}
  <div class="flex justify-center">
    <nav class="border-{accountColor} mt-5 border-2 rounded-full text-{accountColor} h-12 flex w-fit px-11 bg-white absolute">
      <NavBarItem pageName="Accounts" href="/accounts" />
      <NavBarItem pageName="Faculty Records" href="/" />
    </nav>
  </div>
{/if}