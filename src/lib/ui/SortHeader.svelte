<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import Icon from '@iconify/svelte';

    interface Props {
        name: string;
        key: string;
        isSorting: boolean;
    }

    // eslint-disable-next-line prefer-const, no-useless-assignment -- bindable variable changes state and triggers false-positive no-useless-assignment
    let { name, key, isSorting = $bindable() }: Props = $props();

    const sortStates = ['asc', 'desc', null] as const;
    let nextButtonState = $state(0);

    async function sortRows() {
        isSorting = true;
        const url = new URL(page.url);

        // Clear pagination
        url.searchParams.delete('cursor');
        url.searchParams.delete('isNext');

        // Remove preexisting sorts
        url.searchParams.delete('sort-by');

        // Append new order
        if (sortStates[nextButtonState] !== null)
            url.searchParams.append('sort-by', `${sortStates[nextButtonState]}-${key}`);

        await goto(url.toString());
        isSorting = false;
    }
</script>

<button
    class="flex h-full items-center text-center font-semibold text-white"
    type="button"
    onclick={async () => {
        await sortRows();

        // Switch state
        nextButtonState++;
        nextButtonState %= sortStates.length;
    }}
>
    <span>{name}</span>
    {#if sortStates[nextButtonState] === 'asc'}
        <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
    {:else if sortStates[nextButtonState] === 'desc'}
        <Icon icon="tabler:arrow-down" class="ml-3 h-5 w-5 text-white" />
    {:else if sortStates[nextButtonState] === null}
        <Icon icon="tabler:restore" class="ml-3 h-5 w-5 text-white" />
    {/if}
</button>
