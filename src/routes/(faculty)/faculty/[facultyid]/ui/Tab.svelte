<script>
    import { page } from '$app/state';
    import { viewState } from '../states/view-state.svelte';
    const { href, name } = $props();

    const disabled = $derived(!page.url.pathname.includes(href) && viewState.isEditing);
</script>

{#if page.url.pathname.includes(href)}
    <p
        class="w-fit rounded-t-lg border-t-2 border-r-2 border-l-2 border-fims-green px-6 py-1.5 text-3xl text-nowrap text-fims-green"
    >
        {name}
    </p>
{:else if disabled}
    <p
        class="w-fit cursor-not-allowed rounded-t-lg border-t-2 border-r-2 border-b-2 border-l-2 border-fims-gray border-b-fims-green px-6 py-1.5 text-3xl text-nowrap text-fims-gray opacity-60"
    >
        {name}
    </p>
{:else}
    <a
        {href}
        class="w-fit cursor-pointer rounded-t-lg border-t-2 border-r-2 border-b-2 border-l-2 border-fims-green px-6 py-1.5 text-3xl text-nowrap text-fims-green transition-colors hover:bg-fims-green hover:text-white"
        >{name}</a
    >
{/if}
