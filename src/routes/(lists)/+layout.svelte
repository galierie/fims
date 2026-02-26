<script>
    import NavBar from './ui/NavBar.svelte';

    const { data, children } = $props();
    const { canViewAccounts, accountColor } = $derived(data);
</script>

<NavBar {canViewAccounts} {accountColor} />
<main class="min-h-screen bg-[#e9e9e9]">
    {@render children()}
</main>