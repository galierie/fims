<script lang="ts">
    let { field="Field", value="Field Value" } = $props();
</script>

<div class="flex w-full m-5">
    <div class="bg-fims-green w-20 content-center">
        <p class="m-auto text-white">{field}</p>
    </div>
    <div class="bg-white px-2 w-100">
        <p class="text-black">{value}</p>
    </div>
</div>