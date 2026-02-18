<script lang="ts">
    import Field from "../(ui)/Field.svelte";
</script>

<div class="grid grid-cols-4 w-full px-20 gap-4">
    {#each { length: 6}, fieldEntry}
        <Field field="Field" value={`Value ${fieldEntry}`}/>
    {/each}
</div>