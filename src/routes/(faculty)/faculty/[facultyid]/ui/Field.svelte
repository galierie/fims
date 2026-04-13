<script lang="ts">
    import { onMount } from 'svelte';

    import { viewState } from '../states/view-state.svelte';

    interface Props {
        label: string;
        name: string;
        type?: string;
        defaultValue?: string | Date;
        colStart?: number;
        colSpan?: number;
        immutable?: boolean;
        required?: boolean;
        opts?: string[];
    }

    const { label, name, type, defaultValue, colStart, colSpan, immutable, required, opts }: Props = $props();

    const colStartClass = $derived(colStart === undefined ? '' : `col-start-${colStart}`);
    const colSpanClass = $derived(colSpan === undefined ? '' : `col-span-${colSpan}`);

    // Hacky way of preventing FOUC
    let domContainer: HTMLLabelElement | null = $state(null);
    onMount(() => {
        if (domContainer) domContainer.classList.remove('hidden');
    });

    const isLocked = $derived(viewState.isEditing && immutable && defaultValue !== undefined && defaultValue !== '');

    // Safelist Tailwind classes
    // col-span-2
    // col-span-3
    // col-span-4
    // col-span-5
    // col-span-6
    // col-span-7
    // col-span-8
    // col-span-9
    // col-span-10
</script>

<label
    class="flex w-full items-center justify-end {colStartClass} {colSpanClass} hidden"
    bind:this={domContainer}
>
    <span class="mr-2 w-fit text-right">
        {label}
        {#if required}
            <span class="text-fims-red">*</span>
        {/if}
    </span>

    {#if type === 'dropdown'}
        <select
            {name}
            class="h-8 w-45 rounded-sm border-0 bg-white p-1 text-black focus:ring-0 2xl:w-75 disabled:text-black"
            disabled={!viewState.isEditing || isLocked}
            required={required}
        >
            <option value="" disabled selected={!defaultValue}>-</option>
            {#if opts}
                {#each opts as opt}
                    <option value={opt} selected={defaultValue === opt}>{opt}</option>
                {/each}
            {/if}
        </select>
    {:else}
        <input
            type={type ?? 'text'}
            {name}
            class="h-8 w-45 rounded-sm border-0 bg-white p-1 placeholder-fims-gray focus:ring-0 2xl:w-75"
            placeholder="-"
            defaultValue={defaultValue ?? ''}
            disabled={!viewState.isEditing || isLocked}
            required={required}
        />
    {/if}

    {#if isLocked}
        <input type="hidden" {name} value={defaultValue ?? ''} />
    {/if}
</label>
