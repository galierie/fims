<script lang="ts">
    import Icon from '@iconify/svelte';

    import RedButton from '$lib/ui/RedButton.svelte';
    import { viewState } from '../states/view-state.svelte';

    interface Props {
        name?: string;
        defaultValue?: string;
        immutable?: boolean;
        isDeleted?: boolean;
        value?: string;
    }

    // eslint-disable-next-line prefer-const -- changing value and bindable variable
    let { name, defaultValue, immutable, isDeleted, value = $bindable() }: Props = $props();

    let isDialogOpen = $state(false);
</script>

<div class="relative flex w-full items-center">
    <input
        type="text"
        defaultValue={defaultValue ?? ''}
        class="h-8 w-full truncate border-0 focus:ring-0 {isDeleted ? 'text-fims-gray' : ''}"
        disabled
        {name}
        bind:value
    />
    <button
        type="button"
        class="h-8 w-fit text-right bg-white text-fims-gray pr-2 hover:text-black"
        onclick={() => (isDialogOpen = true)}>Expand</button
    >
</div>

<div
    class="fixed top-0 left-0 z-150 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.9)] {isDialogOpen
        ? ''
        : 'hidden'}"
>
    <div class="h-[90%] w-[90%] rounded-2xl bg-white">
        <div class="flex h-[7.5%] items-center justify-end pr-2">
            <RedButton type="button" onclick={() => (isDialogOpen = false)}>
                <Icon icon="tabler:x" class="mr-2 h-5 w-5" />
                <span>Close</span>
            </RedButton>
        </div>
        <textarea
            class="h-[92.5%] w-full whitespace-pre-wrap {isDeleted ? 'text-fims-gray' : ''}"
            disabled={!viewState.isEditing ||
                (immutable && defaultValue !== undefined && defaultValue !== '') ||
                isDeleted}
            defaultValue={defaultValue ?? ''}
            bind:value
        ></textarea
    </div>
</div>
