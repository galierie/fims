<script lang="ts">
    import { goto } from '$app/navigation';
    import GreenButton from './GreenButton.svelte';
    import Icon from '@iconify/svelte';
    import { page } from '$app/state';
    import RedButton from './RedButton.svelte';

    interface Props {
        isSearching: boolean;
        searchTerm: string | null;
    }

    // eslint-disable-next-line no-useless-assignment -- bindable variable changes state and triggers false-positive no-useless-assignment
    let { isSearching = $bindable(), searchTerm }: Props = $props();

    const searchParam = 'search';

    async function search() {
        isSearching = true;
        const url = new URL(page.url);

        // Clear pagination
        url.searchParams.delete('cursor');
        url.searchParams.delete('isNext');

        // Set search parameter
        if (searchTerm) url.searchParams.set(searchParam, searchTerm);
        else url.searchParams.delete(searchParam);

        await goto(url.toString());
        isSearching = false;
    }
</script>

<div class="flex h-10 w-full items-center justify-between *:mx-1">
    <input
        class="w-full rounded-full border-0 bg-white px-7.5 placeholder-fims-gray focus:ring-0"
        name="search"
        type="text"
        placeholder="Search"
        bind:value={searchTerm}
        required
        onkeypress={async (event) => {
            if (event.key === 'Enter') await search();
        }}
    />
    <GreenButton
        type="button"
        onclick={async () => {
            await search();
        }}
    >
        <Icon icon="line-md:search" class="mr-2 h-5 w-5" />
        <span>Search</span>
    </GreenButton>
    <RedButton
        type="button"
        onclick={async () => {
            searchTerm = '';
            await search();
        }}
    >
        <Icon icon="tabler:x" class="mr-2 h-5 w-5" />
        <span>Clear</span>
    </RedButton>
</div>
