<script lang="ts">
    import Profile from "./(tabs)/Profile.svelte";
    import Button from "$lib/ui/Button.svelte";
    import DeleteConfirmation from "$lib/ui/DeleteConfirmation.svelte";

    import { goto } from '$app/navigation';

    let { data } = $props();
    let isDeleting = $state(false);
    const { recordData } = $derived(data);
    if (!recordData) goto('/');


    const tabs = ["Profile"]
    const href = "/record";
    const back = "/";
    const firstName = recordData!.firstName;
    const lastName = recordData!.lastName;

    function deleteAttempt() {
        isDeleting = true;
    }

    function confirmDelete() {
        fetch('/delete-record', {
            method: "POST",
            body: JSON.stringify({deleted: recordData!.facultyid}),
            headers: {
                "Content-Type": 'application/json'
            }
        })
        goto('/');
    }

    function cancelDelete() {
        isDeleting = false
    }
</script>

<br/>

<!-- currently testing components -->
<div class="mt-5 text-fims-green px-5">
    <a href={back} class="text-fims-green">Back to List of Faculty Records</a>
    <h1 class="text-3xl font-semibold mb-[65px]" id="name-display">{lastName}, {firstName}</h1>
    <div class="flex justify-end"><Button color='red' onclick={deleteAttempt}>Delete record</Button></div> 
    <div class= "flex">
        {#each tabs as tab}
            <div class="flex px-4 h-fit w-fit border-x-2 border-t-2 rounded-t-xl items-center text-xl">
                <a {href} class="text-center w-mx m-auto">{tab}</a>
            </div>
        {/each}
    </div>
    <div id="divider" class="h-0.5 mb-10 w-full bg-fims-green"></div>
    <Profile/>
    <!-- TODO: some hacky way of mimicking the ui in figma-->
    {#if isDeleting}
        <DeleteConfirmation onDelete={confirmDelete} onCancel={cancelDelete} text="This will delete the current record. Are you sure?"/>
    {/if}
</div>