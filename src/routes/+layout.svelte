<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';

    import './layout.css';

    import Footer from './ui/Footer.svelte';
    import Header from './ui/Header.svelte';

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
