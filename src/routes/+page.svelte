<script lang="ts">
  import Icon from "@iconify/svelte";
  import FacultyRecordRow from "./(ui)/FacultyRecordRow.svelte";
  let { data } = $props();
  let { facultyRecordList, canViewChangeLogs } = $derived(data);
</script>

<br />

<div>
  <div class="mt-60">
    <!-- Faculty Record List Table -->
    <div class="flex justify-center [&>div]:flex [&>div]:items-center [&>*>span]:font-semibold [&>*>span]:text-white [&>*>span]:text-center [&>div]:bg-fims-green [&>div]:h-12 [&>div]:px-6">
      <!-- Header -->
      <div class="justify-center w-25"><span>Select</span></div>
      <div class="{canViewChangeLogs ? 'w-132' : 'w-182'}">
        <span>Full Name</span>
        <Icon icon="tabler:arrow-up" class="h-5 w-5 text-white ml-3" />
      </div>
      <div class="justify-center w-75">
        <span>Status</span>
        <Icon icon="tabler:arrow-up" class="h-5 w-5 text-white ml-3" />
      </div>
      <div class="justify-center w-75">
        <span>Rank</span>
        <Icon icon="tabler:arrow-up" class="h-5 w-5 text-white ml-3" />
      </div>
      <div class="justify-center w-75">
        <span>Administrative Position</span>
        <Icon icon="tabler:arrow-up" class="h-5 w-5 text-white ml-3" />
      </div>
      {#if canViewChangeLogs}
        <div class="justify-center w-50"><span>Change Logs</span></div>
      {/if}
    </div>

    <!-- Rows -->
    {#each facultyRecordList as facultyRecord (facultyRecord.facultyid)}
      <FacultyRecordRow {facultyRecord} {canViewChangeLogs} />
    {/each}
  </div>
</div>