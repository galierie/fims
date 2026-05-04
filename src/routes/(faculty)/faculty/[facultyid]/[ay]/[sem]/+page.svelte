<script lang="ts">
    import ChangelogList from '$lib/ui/ChangelogList.svelte';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';

    import { chooseSemestralRecord } from '../../states/chosen-semestral-record.svelte.js';
    import { resetViewState, setToEdit } from '../../states/view-state.svelte.js';

    import SemestralRecordForm from './ui/SemestralRecordForm.svelte';

    const { data } = $props();
    const {
        acadYearOpts,
        allSemStrs,
        existingOpts,
        facultyid,
        semestralRecord,
        opts,
        dependencyMaps,
        canViewChangelogs,
        fetchedChangelogs,
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
    acadYearOpts={acadYearOpts ?? []}
    allSemStrs={allSemStrs ?? []}
    existingOpts={existingOpts ?? []}
    facultyid={facultyid ?? 0}
    {semestralRecord}
    {opts}
    {dependencyMaps}
    {previousUrl}
/>

{#if canViewChangelogs && fetchedChangelogs != null}
    <ChangelogList changelogFetcher={() => fetchedChangelogs} />
{/if}
