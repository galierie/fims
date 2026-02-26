<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import Header from './ui/Header.svelte';
    import Footer from './ui/Footer.svelte';

    const { data, children } = $props();
    const { isLoggedIn, accountColor, email } = $derived(data);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isLoggedIn}
    <Header {accountColor} {email} />
    {@render children()}
    <Footer />
{:else}
    {@render children()}
{/if}
