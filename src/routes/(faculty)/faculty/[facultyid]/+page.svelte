<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';

    import GreenButton from '$lib/ui/GreenButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    import { viewState, setToEdit, resetViewState } from './states/view-state.svelte.js';
    
    const { data, form } = $props();
    const { profile } = $derived(data);

    // Ensure view isn't set to editing state on load
    resetViewState();

    let isLoading = $state(false);

    let profileForm: HTMLFormElement | null = null;
    const profileFormId = 'profile-form';
</script>

{#if form?.error}
    <div
        class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6"
    >
        <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
    </div>
{/if}

<div class="flex items-center gap-2">
    {#if viewState.isEditing}
        <GreenButton onclick={() => {
            if (profileForm) profileForm.requestSubmit();
        }}>
            <Icon icon="tabler:device-floppy" class="h-5 w-5 mr-2" />
            <span>Save Record</span>
        </GreenButton>
        <RedButton>
            <Icon icon="tabler:database-off" class="h-5 w-5 mr-2" />
            <span>Discard Changes</span>
        </RedButton>
    {:else}
        <GreenButton onclick={setToEdit}>
            <Icon icon="tabler:edit" class="h-5 w-5 mr-2" />
            <span>Edit</span>
        </GreenButton>
    {/if}
</div>

<form
    method="POST"
    action="?/update"
    id={profileFormId}
    bind:this={profileForm}
    use:enhance={() => {
        resetViewState();
        isLoading = true;
        return async ({ update }) => {
            await update();
            isLoading = false;
        };
    }}
></form>

{#if isLoading}
    <LoadingScreen />
{/if}
