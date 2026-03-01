<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';

    import GreenButton from '$lib/ui/GreenButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    import { chooseSemestralRecord } from '../../states/chosen-semestral-record.svelte.js';
    import { viewState, setToEdit, resetViewState } from '../../states/view-state.svelte.js';

    const { data } = $props();
    const { acadYear, semestralRecord, semNum } = $derived(data);

    // Ensure view isn't set to editing state on load
    resetViewState();

    // Persist chosen semestral record
    $effect(() => (chooseSemestralRecord(acadYear, semNum)));

    let isLoading = $state(false);

    let semestralRecordForm: HTMLFormElement | null = null;
    const semestralRecordFormId = 'semestral-record-form';
</script>

<div class="flex items-center gap-2">
    {#if viewState.isEditing}
        <GreenButton onclick={() => {
            if (semestralRecordForm) semestralRecordForm.requestSubmit();
        }}>
            <Icon icon="tabler:device-floppy" class="h-5 w-5 mr-2" />
            <span>Save Record</span>
        </GreenButton>
        <RedButton>
            <Icon icon="tabler:database-off" class="h-5 w-5 mr-2" />
            <span>Discard Changes</span>
        </RedButton>
    {:else}
        <GreenButton onclick={setToEdit}>
            <Icon icon="tabler:edit" class="h-5 w-5 mr-2" />
            <span>Edit</span>
        </GreenButton>
    {/if}
</div>

<form
    method="POST"
    action="?/update"
    id={semestralRecordFormId}
    bind:this={semestralRecordForm}
    use:enhance={() => {
        resetViewState();
        isLoading = true;
        return async ({ update }) => {
            await update();
            isLoading = false;
        };
    }}
></form>

{#if isLoading}
    <LoadingScreen />
{/if}
