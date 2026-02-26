<script lang="ts">
    let { field="Field", value="Field Value" } = $props();
</script>

<div class="flex w-full">
    <div class="w-50 content-center flex justify-end px-2 items-center">
        <p class="w-fit text-align-right">{field}</p>
    </div>
    <div class="bg-white px-2 w-100 rounded-sm flex justify-begin items-center">
        <p class="">{value}</p>
    </div>
</div>