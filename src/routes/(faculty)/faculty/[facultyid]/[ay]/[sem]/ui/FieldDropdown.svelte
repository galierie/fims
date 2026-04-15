<script lang="ts">
    import Icon from '@iconify/svelte';

    import { viewState } from '../../../states/view-state.svelte';

    interface Props {
        label: string;
        name: string;
        opts: string[];
        selectedOpt: string | null;
        colStart?: number;
        colSpan?: number;
        immutable?: boolean;
        hasChange?: boolean;
        initialOpt?: string | null;
    }

    // eslint-disable-next-line prefer-const -- changing value
    let { label, name, opts, selectedOpt, colStart, colSpan, immutable, hasChange = $bindable(false), initialOpt = selectedOpt }: Props = $props();
    let isDropdownOpen = $state(false);

    const colStartClass = $derived(colStart === undefined ? '' : `col-start-${colStart}`);
    const colSpanClass = $derived(colSpan === undefined ? '' : `col-span-${colSpan}`);

    $effect(() => {
        if (!viewState.isEditing) {
            selectedOpt = initialOpt;
        }
        hasChange = immutable ? false : selectedOpt !== initialOpt;
    });
</script>

<div class="relative w-full {colStartClass} {colSpanClass}">
    <div class="flex w-full items-center justify-end">
        <span class="mr-2 w-fit text-right">{label}</span>
        {#if viewState.isEditing && (!immutable || (immutable && selectedOpt === null))}
            <button
                type="button"
                class="relative h-8 w-45 rounded-sm bg-white px-1.5 text-left 2xl:w-75"
                onclick={() => {
                    isDropdownOpen = !isDropdownOpen;
                }}
            >
                <span>{selectedOpt ? selectedOpt : '-'}</span>
                <Icon
                    icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                    class="absolute top-2 right-1.5 h-4 w-4"
                />
            </button>
        {:else}
            <span class="h-8 w-45 content-center rounded-sm bg-white px-1.5 text-left 2xl:w-75"
                >{selectedOpt ?? '-'}</span
            >
        {/if}
    </div>

    <div
        class="rounded-lg p-1 {isDropdownOpen
            ? 'block'
            : 'hidden'} absolute z-50 w-full bg-white shadow-lg"
    >
        {#each opts as opt (opt)}
            {#if opt === selectedOpt}
                <button
                    type="button"
                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                    onclick={() => {
                        selectedOpt = null;
                        isDropdownOpen = false;
                    }}
                >
                    <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                    <span>{selectedOpt}</span>
                </button>
            {:else}
                <button
                    type="button"
                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                    onclick={() => {
                        selectedOpt = opt;
                        isDropdownOpen = false;
                    }}
                >
                    <div class="w-8 pr-2"></div>
                    <span>{opt}</span>
                </button>
            {/if}
        {/each}
    </div>

    <input type="hidden" {name} value={selectedOpt} />
</div>
