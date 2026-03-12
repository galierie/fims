<script lang="ts">
    import SemestralRecordForm from './ui/SemestralRecordForm.svelte';
    import { resetViewState, setToEdit } from '../../states/view-state.svelte.js';
    import { page } from '$app/stores';
    import { chooseSemestralRecord } from '../../states/chosen-semestral-record.svelte.js';
    import { afterNavigate } from '$app/navigation';

    const { data } = $props();
    const {
        acadYearOpts,
        allSemStrs,
        existingOpts,
        facultyid,
        semestralRecord,
        opts,
        dependencyMaps,
    } = $derived(data);

    // Keep track of the last valid record URL
    let previousUrl: string | null = $state(null);

    afterNavigate(({ from }) => {
        // Only save the previous URL if it was a valid faculty record page
        if (from?.url.pathname.includes(`/faculty/${facultyid}/`)) previousUrl = from.url.pathname;
    });

    $effect(() => {
        const currentAy = parseInt($page.params.ay ?? '', 10);
        const currentSem = parseInt($page.params.sem ?? '', 10);

        if (!Number.isNaN(currentAy) && !Number.isNaN(currentSem))
            chooseSemestralRecord(currentAy, currentSem);

        if (semestralRecord === null) setToEdit();
        else resetViewState();
    });
</script>

<SemestralRecordForm
    {acadYearOpts}
    {allSemStrs}
    {existingOpts}
    {facultyid}
    {semestralRecord}
    {opts}
    {dependencyMaps}
    {previousUrl}
/>
