<script>
    import NavBar from './ui/NavBar.svelte';

    const { data, children } = $props();
    const { canViewNavBar, accountColor } = $derived(data);
</script>

{#if canViewNavBar}
    <NavBar {accountColor} />
{/if}
<main class="min-h-screen bg-[#e9e9e9]">
    {@render children()}
</main>
