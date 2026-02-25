<script lang="ts">
    import { goto } from '$app/navigation';
    import Icon from '@iconify/svelte';
    import { page } from '$app/state';

    interface Props {
        isSearching: boolean;
        searchTerm: string | null;
    }

    // eslint-disable-next-line no-useless-assignment -- bindable variable changes state and triggers false-positive no-useless-assignment
    let { isSearching = $bindable(), searchTerm }: Props = $props();

    const searchParam = 'search';

    async function search() {
        if (!searchTerm) return;

        isSearching = true;
        const url = new URL(page.url);

        // Clear pagination
        url.searchParams.delete('cursor');
        url.searchParams.delete('isNext');

        // Set search parameter
        url.searchParams.set(searchParam, searchTerm);

        await goto(url.toString());
        isSearching = false;
    }
</script>

<div class="relative h-10 w-full rounded-full bg-white">
    <input
        class="w-full border-0 bg-transparent px-7.5 placeholder-fims-gray focus:ring-0"
        name="search"
        type="text"
        placeholder="Search"
        bind:value={searchTerm}
        required
        onkeypress={async (event) => {
            if (event.key === 'Enter') await search();
        }}
    />
    <button
        type="button"
        class="absolute right-4 h-full"
        onclick={async () => {
            await search();
        }}
    >
        <Icon icon="line-md:search" class="h-5 w-5 text-fims-gray hover:text-black" />
    </button>
</div>
