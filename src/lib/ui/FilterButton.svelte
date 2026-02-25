<script lang="ts">
    import type { FilterObject } from '$lib/types/filter';
    import { goto } from '$app/navigation';
    import Icon from '@iconify/svelte';
    import { page } from '$app/state';

    interface Props extends FilterObject {
        isFiltering: boolean;
    }

    // eslint-disable-next-line prefer-const, no-useless-assignment -- bindable variable changes state and triggers false-positive no-useless-assignment
    let { name, filter, opts, selectedOpts, isFiltering = $bindable() }: Props = $props();

    let isFilterOpen = $state(false);

    async function filterOpts() {
        isFiltering = true;
        const url = new URL(page.url);

        // Clear pagination
        url.searchParams.delete('cursor');
        url.searchParams.delete('isNext');

        // Clear filter
        url.searchParams.delete(filter);

        // Upload filters
        selectedOpts.forEach((opt) => {
            url.searchParams.append(filter, opt);
        });

        await goto(url.toString());
        isFiltering = false;
    }

    const borderColor = $derived(selectedOpts.length ? 'border-fims-green' : 'border-fims-gray');
    const textColor = $derived(selectedOpts.length ? 'text-fims-green' : 'text-black');
    const selectedColor = $derived(selectedOpts.length ? 'text-fims-green' : 'text-fims-gray');
</script>

<div class="w-fit">
    <button
        type="button"
        class="flex items-center justify-center border px-4 py-1 {borderColor} rounded-full bg-white"
        onclick={() => (isFilterOpen = !isFilterOpen)}
    >
        <span class="mr-1 {textColor}">{name}:</span>

        <span class={selectedColor}>{selectedOpts.length ? selectedOpts.join(', ') : 'All'}</span>

        <Icon
            icon={isFilterOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            class="h-5 w-5 {textColor}"
        />
    </button>

    <div
        class="mt-1 rounded-lg p-1 {isFilterOpen
            ? 'block'
            : 'hidden'} absolute z-50 w-fit bg-white shadow-lg"
    >
        {#each opts as opt (opt)}
            {#if selectedOpts.includes(opt)}
                <button
                    type="button"
                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                    onclick={async () => {
                        selectedOpts = selectedOpts.filter((elem) => elem !== opt);
                        await filterOpts();
                    }}
                >
                    <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                    <span>{opt}</span>
                </button>
            {:else}
                <button
                    type="button"
                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                    onclick={async () => {
                        selectedOpts.push(opt);
                        await filterOpts();
                    }}
                >
                    <div class="w-8 pr-2"></div>
                    <span>{opt}</span>
                </button>
            {/if}
        {/each}
    </div>
</div>
