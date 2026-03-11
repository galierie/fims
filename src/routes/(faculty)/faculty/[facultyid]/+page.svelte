<script lang="ts">
    import Icon from '@iconify/svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import SaveConfirmation from '$lib/ui/SaveConfirmation.svelte'; // TASK 4
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';

    import { enhance } from '$app/forms';
    import { page } from '$app/state';
    import { beforeNavigate, goto } from '$app/navigation'; // TASK 4
    import { onMount } from 'svelte';

    const { data, form } = $props();
    
    // --- TASK 4: STATE MANAGEMENT ---
    // 1. We create a reactive state for the form fields
    let formData = $state({
        firstname: data.firstname,
        lastname: data.lastname
    });

    // 2. We track if the data is "Dirty" (different from the initial load)
    // This derived rune re-calculates every time the user types
    let isDirty = $derived(
        formData.firstname !== data.firstname || 
        formData.lastname !== data.lastname
    );

    let willDelete = $state(false);
    let showExitWarning = $state(false); // Task 4 toggle
    let isLoading = $state(false);
    let confirmedExit = $state(false); // To bypass the guard after clicking "Save"
    let nextLocation = $state(''); // Stores where the user wanted to go

    // 3. GUARD: SvelteKit Internal Navigation (Clicking links/back button)
    beforeNavigate((nav) => {
        if (isDirty && !confirmedExit && nav.to) {
            nav.cancel(); // Stop the navigation
            nextLocation = nav.to.url.pathname; // Remember where they were going
            showExitWarning = true; // Show the Task 4 modal
        }
    });

    // 4. GUARD: Browser Actions (Closing tab, Refreshing F5)
    onMount(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !confirmedExit) {
                e.preventDefault(); // Standard browser popup trigger
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    // 5. MODAL HANDLERS
    function handleCancelExit() {
        showExitWarning = false;
    }

    function handleConfirmExit() {
        confirmedExit = true; // Set flag to bypass guard
        showExitWarning = false;
        goto(nextLocation); // Proceed to the intended page
    }

    let deleteForm: HTMLFormElement | null = $state(null);
</script>

<!-- TASK 4 MODAL -->
{#if showExitWarning}
    <SaveConfirmation 
        text="You have unsaved changes in the faculty record. Are you sure you want to leave without saving?"
        onSave={handleConfirmExit} 
        onCancel={handleCancelExit}
    />
{/if}

{#if form?.error}
    <div class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6">
        <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
    </div>
{/if}

<div class="p-8">
    <a href="/" class="flex h-7 items-center text-fims-green">
        <Icon icon="line-md:arrow-left-circle" class="mr-2 h-6 w-6" />
        <span class="underline">Back to List of Faculty Records</span>
    </a>

    <!-- TASK 4 TEST INPUTS (Eriene will style these later in Task 1) -->
    <div class="mt-8 grid grid-cols-2 gap-4 max-w-xl bg-white p-6 rounded-lg shadow-sm border border-fims-gray">
        <h2 class="col-span-2 font-bold text-fims-green">Edit Mode (Task 1 & 4)</h2>
        <div class="flex flex-col">
            <label class="text-xs font-semibold text-fims-gray" for="fname">First Name</label>
            <input id="fname" bind:value={formData.firstname} class="border-b-2 border-fims-green p-2 outline-none" />
        </div>
        <div class="flex flex-col">
            <label class="text-xs font-semibold text-fims-gray" for="lname">Last Name</label>
            <input id="lname" bind:value={formData.lastname} class="border-b-2 border-fims-green p-2 outline-none" />
        </div>
    </div>

    <h1 class="mt-8 text-3xl font-semibold text-fims-green" id="name-display">
        {formData.lastname}, {formData.firstname}
    </h1>

    <div class="mt-4 flex justify-between">
        <GreenButton disabled={!isDirty}>
            <Icon icon="tabler:device-floppy" class="mr-2 h-5 w-5" />
            <span>Save Changes (Task 3)</span>
        </GreenButton>
        <RedButton onclick={() => (willDelete = true)}>
            <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
            <span>Delete Record</span>
        </RedButton>
    </div>
</div>

{#if willDelete}
    <form
        method="post"
        action="?/delete"
        bind:this={deleteForm}
        use:enhance={() => {
            willDelete = false;
            isLoading = true;
            return async ({ update }) => {
                confirmedExit = true; // Don't prompt when deleting!
                await update();
                isLoading = false;
            };
        }}
    >
        <input type="hidden" name="facultyid" value={page.params.facultyid} />
        <DeleteConfirmation
            onDelete={() => { if (deleteForm) deleteForm.requestSubmit(); }}
            onCancel={() => (willDelete = false)}
            text="This will delete the current faculty record. Are you sure?"
        />
    </form>
{/if}

{#if isLoading}
    <LoadingScreen />
{/if}
