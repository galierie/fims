<script lang="ts">
    const tabs = ["Profile", "Semestral Records", "Tab1", "Tab2", "Tab3"]
    const href = "/record";
    const back = "/";
    const lastName = "LastName"
    const firstName = "FirstName"
</script>

<br/>

<!-- currently testing components -->
<div class="mt-20 text-fims-green px-5">
    <a href={back} class="underline mb-[31px]">Back to List of Faculty Records</a>
    <h1 class="text-3xl font-semibold mb-[65px]">{lastName}, {firstName}</h1>
    <div class= "flex">
        {#each tabs as tab}
            <div class="flex px-4 h-fit w-fit border-x-2 border-t-2 rounded-t-xl items-center text-xl">
                <a {href} class="text-center w-mx m-auto text-center m-auto">{tab}</a>
            </div>
        {/each}
    </div>
    <!-- TODO: some hacky way of mimicking the ui in figma-->
</div>