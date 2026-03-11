<script lang="ts">
    import Icon from '@iconify/svelte';

    interface Props {
        name?: string;
        opts: string[];
        selectedOpt?: string | null;
        defaultSelectedOpt: string | null;
        isEditable: boolean;
    }

    // eslint-disable-next-line prefer-const -- changing value and bindable variable
    let { name, opts, selectedOpt = $bindable(), defaultSelectedOpt, isEditable }: Props = $props();

    let isDropdownOpen = $state(false);
</script>

<div class="relative h-full w-full">
    <button
        type="button"
        class="relative h-full w-full"
        onclick={() => {
            isDropdownOpen = !isDropdownOpen;
        }}
    >
        <span>{selectedOpt ? selectedOpt : defaultSelectedOpt}</span>
        <Icon
            icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            class="absolute right-1 h-full top-0 w-4"
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
                        selectedOpt = defaultSelectedOpt;
                    }}
                >
                    <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                    <span class="text-left">{selectedOpt}</span>
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
                    <span class="text-left">{opt}</span>
                </button>
            {/if}
        {/each}
    </div>

    <input type="hidden" {name} bind:value={selectedOpt} defaultValue={defaultSelectedOpt} />
</div>
