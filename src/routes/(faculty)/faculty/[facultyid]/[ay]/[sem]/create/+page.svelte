<script>
    import Icon from '@iconify/svelte';

    import GreenButton from '$lib/ui/GreenButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    import { viewState, setToEdit } from '../../../states/view-state.svelte.js';

    // Ensure editing state on navigation here
    setToEdit();

    let isLoading = $state(false);
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

    {#if isLoading}
        <LoadingScreen />
    {/if}
{/if}
