<script>
    import NavBar from './ui/NavBar.svelte';

    const { data, children } = $props();
    const { accountColor } = $derived(data);
</script>

<NavBar {accountColor} />
<main class="min-h-screen bg-[#e9e9e9]">
    {@render children()}
</main>
