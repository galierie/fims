<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import Icon from '@iconify/svelte';
    import FacultyRecordRow from './(ui)/FacultyRecordRow.svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import FilterButton from '$lib/ui/FilterButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import SearchBar from '$lib/ui/SearchBar.svelte';

    const { data, form } = $props();
    const {
        facultyRecordList,
        canViewChangeLogs,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
        filters,
        searchTerm,
    } = $derived(data);

    let selectedIds: Array<number | null> = $state([]);

    let willBatchDelete = $state(false);
    let isLoading = $state(false);
    let deleteForm: HTMLFormElement | null = $state(null);

    function toggleSelection(id: number | null) {
        if (selectedIds.includes(id)) selectedIds = selectedIds.filter((i) => i !== id);
        else selectedIds = [...selectedIds, id];
    }

    function selectAll() {
        selectedIds = facultyRecordList.map(({ facultyid }) => facultyid);
        selectedIds = selectedIds.filter((elem) => elem !== null);
    }

    function deselectAll() {
        selectedIds = [];
    }

    async function goToPage(isNext: boolean = true) {
        isLoading = true;
        const cursor = isNext ? nextCursor : prevCursor;
        const url = new URL(page.url);
        if (cursor) url.searchParams.set('cursor', cursor.toString());
        url.searchParams.set('isNext', isNext ? '1' : '0');
        await goto(url.toString());
        isLoading = false;
    }
    
    async function onRecordClick(id:number) {
        const res = await fetch('/view-record', {
            method: "POST",
            body: JSON.stringify({requested:id}),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        goto('/record');
    }
</script>

{#if form?.error}
    <div
        class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6"
    >
        <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
    </div>
{/if}

<br />

{#if form?.message}
    {#if form?.success}
        <div
            class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-green bg-fims-green-100 px-4 py-6"
        >
            <Icon icon="tabler:check" class="h-6 w-6 text-fims-green" />
            <p class="px-8">{form.message}</p>
        </div>
    {:else}
        <div
            class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-[#ceb676] bg-fims-beige px-4 py-6"
        >
            <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-[#ceb676]" />
            <p class="px-8">{form.message}</p>
        </div>
    {/if}
{/if}

<div>
    <!-- Search Bar -->
    <div class="mt-25 flex justify-center">
        <div class="flex w-315 items-center 2xl:w-432">
            <SearchBar bind:isSearching={isLoading} {searchTerm} />
        </div>
    </div>

    <!-- Filter Buttons -->
    <div class="mt-1 flex justify-center">
        <div class="flex w-315 items-center 2xl:w-432">
            <span class="mr-1">Show:</span>
            {#each filters as { name, filter, opts, selectedOpts } (name)}
                <div class="mr-1">
                    <FilterButton
                        {name}
                        {filter}
                        {opts}
                        {selectedOpts}
                        bind:isFiltering={isLoading}
                    />
                </div>
            {/each}
        </div>
    </div>

    <!-- Show on Row Select -->
    <div class="flex justify-center">
        {#if selectedIds.length > 0}
            <div class="mt-6 flex w-315 justify-between 2xl:w-432">
                <div class="flex gap-2">
                    <GreenButton onclick={selectAll}>Select All</GreenButton>
                    <RedButton onclick={deselectAll}>Deselect Selection</RedButton>
                    <GreenButton>
                        <Icon icon="tabler:file-export" class="mr-2 h-5 w-5" />
                        <span>Export Reports</span>
                    </GreenButton>
                </div>
                <div>
                    <RedButton onclick={() => (willBatchDelete = true)}>
                        <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                        <span
                            >Delete {selectedIds.length}
                            {selectedIds.length > 1 ? 'Records' : 'Record'}</span
                        >
                    </RedButton>
                </div>
            </div>
        {:else}
            <div class="mt-15"></div>
        {/if}
    </div>

    <!-- Faculty Record List Table -->
    <div class="mt-2.5">
        <!-- Header -->
        <div
            class="flex justify-center [&>*>span]:text-center [&>*>span]:font-semibold [&>*>span]:text-white [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:bg-fims-green [&>div]:px-6"
        >
            <div class="w-25 justify-center"><span>Select</span></div>
            <div class={canViewChangeLogs ? 'w-66 2xl:w-132' : 'w-91 2xl:w-182'}>
                <span>Full Name</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-50 justify-center 2xl:w-75">
                <span>Status</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-62.5 justify-center 2xl:w-75">
                <span>Rank</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-62.5 justify-center 2xl:w-75">
                <span>Administrative Position</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            {#if canViewChangeLogs}
                <div class="w-50 justify-center"><span>Change Logs</span></div>
            {/if}
        </div>

        <!-- Rows -->
        {#each facultyRecordList as facultyRecord (facultyRecord.facultyid)}
            <FacultyRecordRow
                {facultyRecord}
                {canViewChangeLogs}
                isSelected={selectedIds.includes(facultyRecord.facultyid)}
                onToggle={() => toggleSelection(facultyRecord.facultyid)}
                clickCallback={onRecordClick}
            />
        {/each}

        <!-- Pagination Controls -->
        <div class="mt-2 flex justify-center">
            <div class="flex w-315 items-center justify-between 2xl:w-432">
                <GreenButton onclick={() => goToPage(false)} type="button" disabled={!hasPrev}>
                    <Icon icon="line-md:arrow-left-circle" class="mr-2 h-5 w-5" />
                    <span>Previous</span>
                </GreenButton>
                <GreenButton onclick={() => goToPage(true)} type="button" disabled={!hasNext}>
                    <span>Next</span>
                    <Icon icon="line-md:arrow-right-circle" class="ml-2 h-5 w-5" />
                </GreenButton>
            </div>
        </div>
    </div>
</div>

{#if isLoading}
    <LoadingScreen />
{/if}

{#if willBatchDelete}
    <form
        bind:this={deleteForm}
        method="POST"
        action="?/delete"
        use:enhance={() => {
            willBatchDelete = false;
            isLoading = true;
            return async ({ update }) => {
                selectedIds = [];
                await update();
                isLoading = false;
            };
        }}
    >
        <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />

        <DeleteConfirmation
            text={`Are you sure you want to delete ${selectedIds.length} faculty ${selectedIds.length > 1 ? 'records' : 'record'}?`}
            onCancel={() => (willBatchDelete = false)}
            onDelete={() => {
                if (deleteForm) deleteForm.requestSubmit();
            }}
        />
    </form>
{/if}
