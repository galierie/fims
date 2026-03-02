<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';

    import GreenButton from '$lib/ui/GreenButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    import { viewState, setToEdit, resetViewState } from '../../../states/view-state.svelte.js';

    // Ensure editing state on navigation here
    setToEdit();

    let isLoading = $state(false);

    let makeForm: HTMLFormElement | null = $state(null);
    const makeFormId = 'make-semestral-record-form';
</script>

{#if viewState.isEditing}
    <div class="flex items-center gap-2">
        <GreenButton>
            <Icon icon="tabler:device-floppy" class="h-5 w-5 mr-2" />
            <span>Save Record</span>
        </GreenButton>
        <RedButton>
            <Icon icon="tabler:database-off" class="h-5 w-5 mr-2" />
            <span>Discard Changes</span>
        </RedButton>
    </div>

    <form
        method="POST"
        action="?/update"
        id={makeFormId}
        bind:this={makeForm}
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
{/if}
