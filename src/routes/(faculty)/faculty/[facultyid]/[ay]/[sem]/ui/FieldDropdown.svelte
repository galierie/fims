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
    }

    // eslint-disable-next-line prefer-const -- changing value
    let { label, name, opts, selectedOpt, colStart, colSpan, immutable }: Props = $props();

    let isDropdownOpen = $state(false);

    let colStartClass = $derived(colStart === undefined ? '' : `col-start-${colStart}`);
    let colSpanClass = $derived(colSpan === undefined ? '' : `col-span-${colSpan}`);
</script>

<div class="relative w-full {colStartClass} {colSpanClass}">
    <div class="flex items-center justify-end w-full">
        <span class="w-fit text-right mr-2">{label}</span>
        {#if viewState.isEditing && (!immutable || (immutable && selectedOpt === null))}
            <button
                type="button"
                class="relative w-45 px-1.5 2xl:w-75 text-left h-8 rounded-sm bg-white"
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
            <span class="w-45 px-1.5 2xl:w-75 content-center text-left h-8 rounded-sm bg-white">{selectedOpt ?? '-'}</span>
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
