<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { AccountType } from '$lib/types/account-type';
  import Header from './(ui)/Header.svelte';
  import Footer from './(ui)/Footer.svelte';
  import NavBar from './(ui)/NavBar.svelte';

  let { data, children } = $props();
  let { accountType, accountColor, email } = $derived(data);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if accountType === AccountType.None}
  {@render children()}
{:else}
  <Header {accountType} {accountColor} {email} />
  <NavBar {accountType} {accountColor} />
  <main class="bg-[#e9e9e9] h-screen">
    {@render children()}
  </main>
  <Footer />
{/if}
