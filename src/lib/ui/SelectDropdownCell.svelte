<script lang="ts">
    import Icon from '@iconify/svelte';

    interface Props {
        name?: string;
        opts: string[];
        selectedOpt?: string | null;
        defaultSelectedOpt: string | null;
        isEditable: boolean;
        hasChange?: boolean;
        isRequired?: boolean;
        isCombobox?: boolean;
    }

    let {
        name,
        opts,
        selectedOpt = $bindable(),
        defaultSelectedOpt,
        isEditable,
        hasChange = $bindable(),
        isRequired = false,
        isCombobox = false,
    }: Props = $props();

    $effect(() => {
        if (hasChange !== undefined) hasChange = selectedOpt !== defaultSelectedOpt;
    });

    let isDropdownOpen = $state(false);
</script>

<div class="relative h-full w-full">
    {#if isEditable}
        {#if isCombobox}
            <div class="relative flex h-full w-full items-center">
                <input
                    type="text"
                    class="h-full w-full border-0 bg-transparent px-0 pl-1 focus:ring-0"
                    bind:value={selectedOpt}
                    placeholder={defaultSelectedOpt !== '-' ? defaultSelectedOpt : ''}
                    onclick={() => (isDropdownOpen = true)}
                />
                <button
                    type="button"
                    class="absolute right-1 h-full w-4"
                    onclick={() => (isDropdownOpen = !isDropdownOpen)}
                    tabindex="-1"
                >
                    <Icon
                        icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                        class="h-full w-full"
                    />
                </button>
            </div>
        {:else}
            <button
                type="button"
                class="relative h-full w-full"
                onclick={() => {
                    if (isEditable) isDropdownOpen = !isDropdownOpen;
                }}
            >
                <span>{selectedOpt ? selectedOpt : defaultSelectedOpt}</span>
                <Icon
                    icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                    class="absolute top-0 right-1 h-full w-4"
                />
            </button>
        {/if}
    {:else}
        <div class="flex h-full items-center justify-center">
            <span>{selectedOpt ? selectedOpt : defaultSelectedOpt}</span>
        </div>
    {/if}

    {#if isEditable}
        <div
            class="rounded-lg p-1 {isDropdownOpen
                ? 'block'
                : 'hidden'} absolute z-50 max-h-60 w-full overflow-y-auto bg-white shadow-lg"
        >
            {#each opts as opt (opt)}
                {#if opt === selectedOpt}
                    <button
                        type="button"
                        class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                        onclick={() => {
                            selectedOpt = defaultSelectedOpt;
                            isDropdownOpen = false;
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
                            isDropdownOpen = false;
                        }}
                    >
                        <div class="w-8 pr-2"></div>
                        <span class="text-left">{opt}</span>
                    </button>
                {/if}
            {/each}
        </div>
    {/if}

    <input
        type="text"
        {name}
        value={!selectedOpt || selectedOpt === '-' ? defaultSelectedOpt : selectedOpt}
        class="pointer-events-none absolute bottom-0 left-0 -z-10 h-0 w-full opacity-0"
        required={isRequired}
        tabindex="-1"
    />
</div>
