<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import FacultyRecordRow from './(ui)/FacultyRecordRow.svelte';
    import Button from '$lib/ui/Button.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';

    type FacultyRecord = { facultyid: number };
    const { data } = $props();
    const { facultyRecordList, canViewChangeLogs } = $derived(data);

    let selectedIds = $state<number[]>([]);

    let isModalOpen = $state(false);
    let isLoading = $state(false);
    let deleteForm: HTMLFormElement | null = $state(null);

    function toggleSelection(id: number) {
        if (selectedIds.includes(id)) selectedIds = selectedIds.filter((i) => i !== id);
        else selectedIds = [...selectedIds, id];
    }

    function selectAll() {
        selectedIds = facultyRecordList.map((f: FacultyRecord) => f.facultyid);
    }

    function deselectAll() {
        selectedIds = [];
    }
</script>

<br />

<div class="mx-auto mt-20 w-full max-w-4xl px-6">
    <form method="GET" action="/" class="flex items-center gap-4">
        <div class="relative w-full">
            <input
                type="text"
                name="search"
                value={data.searchTerm}
                placeholder="Search faculty by name..."
                class="h-12 w-full rounded-full border-2 border-fims-green bg-white px-6 py-2 outline-none focus:ring-2 focus:ring-fims-green"
            />
        </div>
        <button
            type="submit"
            class="hover:bg-opacity-90 h-12 rounded-full bg-fims-green px-8 font-semibold text-white"
        >
            Search
        </button>
        {#if data.searchTerm}
            <a href="/" class="font-medium text-fims-red underline">Clear</a>
        {/if}
    </form>
</div>

<div>
    <div class="mt-15 flex justify-center">
        <div class="flex h-20 w-315 items-end justify-between 2xl:w-432">
            {#if selectedIds.length > 0}
                <div class="flex gap-2">
                    <Button onclick={selectAll} color="green">Select All</Button>
                    <Button onclick={deselectAll} color="red">Deselect Selection</Button>
                </div>
                <div>
                    <Button onclick={() => (isModalOpen = true)} color="red">
                        <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                        <span>Delete ({selectedIds.length})</span>
                    </Button>
                </div>
            {/if}
        </div>
    </div>
    <div class="mt-2.5">
        <!-- Faculty Record List Table -->
        <div
            class="flex justify-center [&>*>span]:text-center [&>*>span]:font-semibold [&>*>span]:text-white [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:bg-fims-green [&>div]:px-6"
        >
            <!-- Header -->
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
            />
        {/each}
    </div>
</div>

{#if isLoading}
    <LoadingScreen />
{/if}

{#if isModalOpen && !isLoading}
    <form
        bind:this={deleteForm}
        method="POST"
        action="?/delete"
        use:enhance={() => {
            isModalOpen = false;
            isLoading = true;

            return async ({ result, update }) => {
                if (result.type === 'success') {
                    selectedIds = [];
                    await update();
                }
                isLoading = false;
            };
        }}
    >
        <input type="hidden" name="ids" value={JSON.stringify(selectedIds)} />

        <DeleteConfirmation
            text={`Are you sure you want to delete ${selectedIds.length} faculty record(s)?`}
            onCancel={() => (isModalOpen = false)}
            onDelete={() => {
                if (deleteForm) deleteForm.requestSubmit();
            }}
        />
    </form>
{/if}
