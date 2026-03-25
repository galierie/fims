<script lang="ts">
    import Icon from '@iconify/svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import Tab from './ui/Tab.svelte';
    import ExportReportModal from '$lib/ui/ExportReportModal.svelte';

    import { enhance } from '$app/forms';
    import { page } from '$app/state';

    import { chosenSemestralRecord, chooseSemestralRecord } from './states/chosen-semestral-record.svelte.js';
    import { viewState } from './states/view-state.svelte.js';

    const { data, children } = $props();
    const { facultyid, lastName, firstName, latestAcadYear, latestSemNum } = $derived(data);

    let willDelete = $state(false);
    let isLoading = $state(false);
    let isExportModalOpen = $state(false);

    let deleteForm: HTMLFormElement | null = $state(null);

    $effect(() => {
        if (page.params.ay && page.params.sem) {
            chooseSemestralRecord(parseInt(page.params.ay, 10), parseInt(page.params.sem, 10));
        } else {
            // If on Profile page, reset state to latest DB values
            chooseSemestralRecord(latestAcadYear, latestSemNum);
        }
    });
</script>

<main class="bg-[#e9e9e9]">
    <div class="mx-6 pt-7.5 pb-40">
        <div>
            {#if viewState.isEditing}
                <p class="flex h-7 items-center text-fims-gray">
                    <Icon icon="line-md:arrow-left-circle" class="mr-2 h-6 w-6" />
                    <span class="underline">Back to List of Faculty Records</span>
                </p>
            {:else}
                <a href="/" class="flex h-7 items-center text-fims-green">
                    <Icon icon="line-md:arrow-left-circle" class="mr-2 h-6 w-6" />
                    <span class="underline">Back to List of Faculty Records</span>
                </a>
            {/if}
            <h1 class="mt-8 text-3xl font-semibold text-fims-green" id="name-display">
                {lastName}, {firstName}
            </h1>
        </div>

        <div class="mt-4 flex justify-between">
            <GreenButton onclick={() => (isExportModalOpen = true)}>
                <Icon icon="tabler:file-export" class="mr-2 h-5 w-5" />
                <span>Export Reports</span>
            </GreenButton>
            <RedButton onclick={() => (willDelete = true)}>
                <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                <span>Delete Record</span>
            </RedButton>
        </div>

        <!-- Tabs -->
        <div class="mt-5 mb-1 flex w-full items-end justify-start">
            <Tab href="/faculty/{facultyid}/profile" name="Profile" />
            <Tab
                href="/faculty/{facultyid}/{chosenSemestralRecord.acadYear}/{chosenSemestralRecord.semNum}"
                name="Semestral Records"
            />
            <div class="w-full border-b-2 border-fims-green"></div>
        </div>

        {@render children()}
    </div>
</main>

{#if willDelete}
    <form
        method="post"
        action="?/delete"
        bind:this={deleteForm}
        use:enhance={() => {
            willDelete = false;
            isLoading = true;
            return async ({ update }) => {
                await update();
                isLoading = false;
            };
        }}
    >
        <input type="hidden" name="facultyid" value={page.params.facultyid} />

        <DeleteConfirmation
            onDelete={() => {
                if (deleteForm) deleteForm.requestSubmit();
            }}
            onCancel={() => (willDelete = false)}
            text="This will delete the current faculty record. Are you sure?"
        />
    </form>
{/if}

{#if isExportModalOpen}
    <ExportReportModal
        selectedFaculty={[{ facultyid: Number(facultyid), lastname: lastName, firstname: firstName }]}
        onCancel={() => (isExportModalOpen = false)}
    />
{/if}

{#if isLoading}
    <LoadingScreen />
{/if}
