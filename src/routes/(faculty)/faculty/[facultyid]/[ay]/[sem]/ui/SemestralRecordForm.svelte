<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    import AcadYearSemSelect from './AcadYearSemSelect.svelte';
    import FieldDropdown from './FieldDropdown.svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import AdminSection from './sections/AdminSection.svelte';
    import TeachingSection from './sections/TeachingSection.svelte';
    import ResearchSection from './sections/ResearchSection.svelte';
    import ExtensionSection from './sections/ExtensionSection.svelte';
    import StudyLoadSection from './sections/StudyLoadSection.svelte';

    import { viewState, setToEdit, resetViewState } from '../../../states/view-state.svelte.js';
    import type { FacultySemestralRecordDTO } from '$lib/server/queries/faculty-view.js';

    interface AcadYearSemOpts {
        acadYear: number | null;
        semNum: number | null;
    }

    interface Props {
        acadYearOpts: number[];
        allSemStrs: string[];
        existingOpts: AcadYearSemOpts[];
        facultyid: number;
        semestralRecord?: FacultySemestralRecordDTO;
        opts?: Map<string, Array<string>>;
        dependencyMaps?: Map<string, Map<string, string>>;
        previousUrl?: string | null; // <-- Add this
    }

    const {
        acadYearOpts,
        allSemStrs,
        existingOpts,
        facultyid,
        semestralRecord,
        opts,
        dependencyMaps,
        previousUrl,
    }: Props = $props();

    // Check for changes
    const haveChanges: boolean[] = $state(Array(5).fill(false));
    const basicHaveChanges: boolean[] = $state(Array(2).fill(false));
    // svelte-ignore state_referenced_locally
    let remarksValue = $state(semestralRecord?.remarks ?? '');
    let remarksChanged = $derived(remarksValue !== (semestralRecord?.remarks ?? ''));
    const hasChange = $derived(
        haveChanges.some((e) => e === true) || 
        basicHaveChanges.some((e) => e === true) || 
        remarksChanged
    );

    $effect(() => {
        if (!viewState.isEditing) {
            remarksValue = semestralRecord?.remarks ?? '';
        }
    });

    let isLoading = $state(false);
    let willDiscardChanges = $state(false);

    let semestralRecordForm: HTMLFormElement | null = null;
    const semestralRecordFormId = 'semestral-record-form';

    let administrativeLoadCredit = $state(0);
    let teachingLoadCredit = $state(0);
    let researchLoadCredit = $state(0);
    let extensionLoadCredit = $state(0);
    let studyLoadCredit = $state(0);

    const totalCredit = $derived(
        administrativeLoadCredit +
            teachingLoadCredit +
            researchLoadCredit +
            extensionLoadCredit +
            studyLoadCredit,
    );

    const loadStatus = $derived(
        totalCredit < 12 ? 'Underload' : totalCredit <= 18 ? 'Normal' : 'Overload',
    );

    // Handle tab exit with unsaved changes
    function beforeExit(event: BeforeUnloadEvent) {
        if (viewState.isEditing && hasChange) event.preventDefault();
    }

    onMount(() => {
        if (browser) window.addEventListener('beforeunload', beforeExit);

        return () => {
            if (browser) window.removeEventListener('beforeunload', beforeExit);
        };
    });
</script>

<form
    method="POST"
    action="?/update"
    id={semestralRecordFormId}
    bind:this={semestralRecordForm}
    onreset={async (e) => {
        e.preventDefault();

        if (semestralRecord === null) {
            isLoading = true;

            const { goto } = await import('$app/navigation');
            // If "discard changes" is clicked for a new sem record, go to prev URL
            if (previousUrl) await goto(previousUrl);
            else await goto(`/faculty/${facultyid}/profile`);

            isLoading = false;
        } else {
            // If "discard changes" is clicked for an existing sem record, read-only state
            resetViewState();
            willDiscardChanges = false;
        }
    }}
    use:enhance={() => {
        resetViewState();
        isLoading = true;
        return async ({ update }) => {
            await update({ reset: false });
            isLoading = false;
        };
    }}
>
    <div class="flex items-center gap-2">
        {#if viewState.isEditing}
            <GreenButton
                type="button"
                onclick={() => {
                    if (semestralRecordForm) semestralRecordForm.requestSubmit();
                }}
            >
                <Icon icon="tabler:device-floppy" class="mr-2 h-5 w-5" />
                <span>Save Record</span>
            </GreenButton>
            <RedButton
                type="button"
                onclick={() => {
                    if (semestralRecordForm)
                        if (hasChange) willDiscardChanges = true;
                        else semestralRecordForm.reset();
                }}
            >
                <Icon icon="tabler:database-off" class="mr-2 h-5 w-5" />
                <span>Discard Changes</span>
            </RedButton>
        {:else}
            <GreenButton type="button" onclick={setToEdit}>
                <Icon icon="tabler:edit" class="mr-2 h-5 w-5" />
                <span>Edit</span>
            </GreenButton>
        {/if}
        <AcadYearSemSelect {acadYearOpts} {allSemStrs} {existingOpts} {facultyid} />
    </div>

    <div>
        <div class="grid w-full grid-cols-8"><div class="col-span-8"></div></div>
        <div class="mt-4 grid w-full grid-cols-8">
            <p class="flex w-full items-center">
                <span class="text-align-right mr-2 w-fit">Total Credit:</span>
                <span>{totalCredit}</span>
            </p>
            <FieldDropdown
                label="Current Rank"
                name="current-rank"
                opts={opts?.get('rankTitles') ?? []}
                selectedOpt={semestralRecord?.currentRankTitle ?? ''}
                colSpan={3}
                bind:hasChange={basicHaveChanges[0]}
            />
        </div>
        <div class="mt-4 grid w-full grid-cols-8">
            <p class="flex w-full items-center">
                <span class="text-align-right mr-2 w-fit">Load Status:</span>
                <span>{loadStatus}</span>
            </p>
            <FieldDropdown
                label="Current Highest Educational Attainment"
                name="current-highest-educational-attainment"
                opts={opts?.get('degrees') ?? []}
                selectedOpt={semestralRecord?.currentHighestDegree ?? ''}
                colSpan={3}
                bind:hasChange={basicHaveChanges[1]}
            />
        </div>
        <div class="mt-8.5">
            <label for="remarks">
                <span>Remarks</span>
            </label>
            <textarea
                name="remarks"
                id="remarks"
                class="mt-4 h-fit min-h-90 w-full rounded-2xl border-0 bg-white p-1.5 placeholder-fims-gray focus:ring-0"
                disabled={!viewState.isEditing}
                bind:value={remarksValue}
            ></textarea>
        </div>
    </div>

    <div class="[&>div]:mt-8.5">
        <AdminSection
            bind:administrativeLoadCredit
            adminPositions={semestralRecord?.adminPositions ?? []}
            committees={semestralRecord?.committees ?? []}
            adminWorks={semestralRecord?.adminWorks ?? []}
            {opts}
            bind:hasChange={haveChanges[0]}
        />
        <TeachingSection
            bind:teachingLoadCredit
            coursesTaught={semestralRecord?.coursesTaught ?? []}
            mentees={semestralRecord?.mentees ?? []}
            {opts}
            {dependencyMaps}
            bind:hasChange={haveChanges[1]}
        />
        <ResearchSection
            bind:researchLoadCredit
            researchWork={semestralRecord?.researchWork ?? []}
            {opts}
            {dependencyMaps}
            bind:hasChange={haveChanges[2]}
        />
        <ExtensionSection
            bind:extensionLoadCredit
            extensionWork={semestralRecord?.extensionWork ?? []}
            bind:hasChange={haveChanges[3]}
        />
        <StudyLoadSection
            bind:studyLoadCredit
            studyLoad={semestralRecord?.studyLoad ?? []}
            bind:hasChange={haveChanges[4]}
        />
    </div>
</form>

{#if isLoading}
    <LoadingScreen />
{/if}

{#if willDiscardChanges}
    <DeleteConfirmation
        onDelete={() => {
            if (semestralRecordForm) semestralRecordForm.reset();
        }}
        onCancel={() => {
            willDiscardChanges = false;
        }}
        text="You have unsaved changes. Do you want to discard them?"
        confirmText="Discard"
        cancelText="Keep"
    />
{/if}
