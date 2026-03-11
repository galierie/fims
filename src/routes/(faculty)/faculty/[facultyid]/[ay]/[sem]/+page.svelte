<script lang="ts">
    import SemestralRecordForm from './ui/SemestralRecordForm.svelte';

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
