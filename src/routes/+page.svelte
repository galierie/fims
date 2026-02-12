<script lang="ts">
    import Icon from '@iconify/svelte';
    import FacultyRecordRow from './(ui)/FacultyRecordRow.svelte';
    const { data } = $props();
    const { facultyRecordList, canViewChangeLogs } = $derived(data);
</script>

<br />

<div>
    <div class="mt-60">
        <!-- Faculty Record List Table -->
        <div
            class="flex justify-center [&>*>span]:text-center [&>*>span]:font-semibold [&>*>span]:text-white [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:bg-fims-green [&>div]:px-6"
        >
            <!-- Header -->
            <div class="w-25 justify-center"><span>Select</span></div>
            <div class={canViewChangeLogs ? 'w-132' : 'w-182'}>
                <span>Full Name</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-75 justify-center">
                <span>Status</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-75 justify-center">
                <span>Rank</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-75 justify-center">
                <span>Administrative Position</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            {#if canViewChangeLogs}
                <div class="w-50 justify-center"><span>Change Logs</span></div>
            {/if}
        </div>

        <!-- Rows -->
        {#each facultyRecordList as facultyRecord (facultyRecord.facultyid)}
            <FacultyRecordRow {facultyRecord} {canViewChangeLogs} />
        {/each}
    </div>
</div>
