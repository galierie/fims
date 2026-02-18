<script lang="ts">
    import Profile from "./(tabs)/Profile.svelte";

    const tabs = ["Profile"]
    const href = "/record";
    const back = "/";
    const lastName = "LastName"
    const firstName = "FirstName"
</script>

<br/>

<!-- currently testing components -->
<div class="mt-20 text-fims-green px-5">
    <h1 class="text-3xl font-semibold mb-[65px]" id="name-display">{lastName}, {firstName}</h1>
    <div class= "flex">
        {#each tabs as tab}
            <div class="flex px-4 h-fit w-fit border-x-2 border-t-2 rounded-t-xl items-center text-xl">
                <a {href} class="text-center w-mx m-auto text-center m-auto">{tab}</a>
            </div>
        {/each}
    </div>
    <div id="divider" class="h-0.5 mb-10 w-full bg-fims-green"></div>
    <Profile/>
    <!-- TODO: some hacky way of mimicking the ui in figma-->
</div>