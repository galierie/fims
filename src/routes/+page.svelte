<script lang="ts">
  let { data } = $props();
  let { facultyRecordList } = $derived(data);
</script>

<p>yippee!</p>
{#each facultyRecordList as { lastname, firstname, status, ranktitle, adminposition, facultyid } (facultyid)}
  <p>{lastname}, {firstname}</p>
  <br />
  <p>{status}</p>
  <br />
  <p>{ranktitle}</p>
  <br />
  <p>{adminposition}</p>
{/each}