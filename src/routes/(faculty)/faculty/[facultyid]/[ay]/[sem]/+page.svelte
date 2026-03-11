<script lang="ts">
    import SemestralRecordForm from './ui/SemestralRecordForm.svelte';
    import ChangelogList from '$lib/ui/ChangelogList.svelte';

    import { resetViewState } from '../../states/view-state.svelte.js';

    const { data } = $props();
    const {
        acadYearOpts,
        allSemStrs,
        existingOpts,
        facultyid,
        semestralRecord,
        opts,
        dependencyMaps,
        canViewChangeLogs,
        fetchedChangelogs,
    } = $derived(data);

    // Ensure view isn't set to editing state on load
    resetViewState();
</script>

<SemestralRecordForm
    {acadYearOpts}
    {allSemStrs}
    {existingOpts}
    {facultyid}
    {semestralRecord}
    {opts}
    {dependencyMaps}
/>

{#if canViewChangeLogs && fetchedChangelogs != null}
<ChangelogList changelogFetcher={() => fetchedChangelogs}/>
{/if}
