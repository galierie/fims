<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import Header from './(ui)/Header.svelte';
    import Footer from './(ui)/Footer.svelte';
    import NavBar from './(ui)/NavBar.svelte';

    const { data, children } = $props();
    const { isLoggedIn, canViewAccounts, accountColor, email } = $derived(data);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isLoggedIn}
    <Header {accountColor} {email} />
    <NavBar {canViewAccounts} {accountColor} />
    <main class="h-screen bg-[#e9e9e9]">
        {@render children()}
    </main>
    <Footer />
{:else}
    {@render children()}
{/if}
