<script lang="ts">
    import Field from "../ui/Field.svelte";

    let displayedFields = [
        "Last Name",
        "First Name",
        "Middle Name",
        "Suffix",
        "Birth Date",
        "Maiden Name",
    ];
</script>

<div class="grid grid-cols-4 w-full px-20 gap-4">
    {#each displayedFields as fieldName, idx}
        <Field field={fieldName} value={`Value ${idx}`}/>
    {/each}
</div>