<script lang="ts">
    const tabs = ["Profile", "Semestral Records", "Tab1", "Tab2", "Tab3"]
    const href = "/record";
</script>

<!-- currently testing components -->
<div class= "flex ">
    {#each tabs as tab}
        <div class="flex px-4 h-fit w-fit border-x-2 border-t-2 rounded-t-xl items-center text-xl text-fims-green">
            <a {href} class="text-center w-mx m-auto text-center m-auto">{tab}</a>
        </div>
    {/each}
</div>