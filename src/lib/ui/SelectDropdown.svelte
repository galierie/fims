<script lang="ts">
    import Icon from '@iconify/svelte';

    interface Props {
        name: string;
        opts: string[];
        selectedOpt: string | null;
    }

    // eslint-disable-next-line prefer-const -- bindable variable
    let { name, opts, selectedOpt = $bindable() }: Props = $props();

    let isDropdownOpen = $state(false);
</script>

<div class="relative w-full">
    <button
        type="button"
        class="relative w-full"
        onclick={() => {
            isDropdownOpen = !isDropdownOpen;
        }}
    >
        <span>{selectedOpt ? selectedOpt : 'No option selected'}</span>
        <Icon
            icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            class="absolute top-1 right-0 h-4 w-4"
        />
    </button>

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
