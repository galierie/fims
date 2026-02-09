<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { AccountType } from '$lib/types/account-type';
    import Header from './(ui)/Header.svelte';
    import Footer from './(ui)/Footer.svelte';
    import NavBar from './(ui)/NavBar.svelte';

    const { data, children } = $props();
    const { accountType, accountColor, email } = $derived(data);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if accountType === AccountType.None}
    {@render children()}
{:else}
    <Header {accountColor} {email} />
    <NavBar {accountType} {accountColor} />
    <main class="h-screen bg-[#e9e9e9]">
        {@render children()}
    </main>
    <Footer />
{/if}
