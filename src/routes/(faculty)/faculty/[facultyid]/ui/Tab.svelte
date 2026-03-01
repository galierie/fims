<script>
    import { page } from "$app/state";
    import { viewState } from "../states/view-state.svelte";
    const { href, name } = $props();

    const unselected = $derived(
        (page.url.pathname === href)
            ? ''
            : 'border-b-2'
    );

    let disabled = $derived(page.url.pathname !== href && viewState.isEditing);
</script>

{#if disabled}
    <p class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-gray py-1.5 px-6 text-3xl text-fims-gray w-fit text-nowrap border-b-2 border-b-fims-green">{name}</p>
{:else}
    <a {href} class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-green py-1.5 px-6 text-3xl text-fims-green hover:bg-fims-green hover:text-white w-fit text-nowrap {unselected}">{name}</a>
{/if}