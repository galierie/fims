<script>
    import { page } from "$app/state";
    import { viewState } from "../states/view-state.svelte";
    const { href, name } = $props();

    let disabled = $derived(page.url.pathname.includes(href) && viewState.isEditing);
</script>

{#if page.url.pathname.includes(href)}
    <p class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-green py-1.5 px-6 text-3xl text-fims-green hover:bg-fims-green hover:text-white w-fit text-nowrap cursor-pointer">{name}</p>
{:else if disabled}
    <p class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-gray py-1.5 px-6 text-3xl text-fims-gray w-fit text-nowrap border-b-2 border-b-fims-green cursor-pointer">{name}</p>
{:else}
    <a {href} class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-green py-1.5 px-6 text-3xl text-fims-green hover:bg-fims-green hover:text-white w-fit text-nowrap border-b-2">{name}</a>
{/if}