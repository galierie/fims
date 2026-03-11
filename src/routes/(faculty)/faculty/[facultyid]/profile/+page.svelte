<script lang="ts">
    import Icon from '@iconify/svelte';

    import ProfileForm from '../ui/ProfileForm.svelte';

    import { resetViewState } from '../states/view-state.svelte.js';

    const { data, form } = $props();
    const { profile, opts, dependencyMaps } = $derived(data);

    // Ensure view isn't set to editing state on load
    resetViewState();
</script>

{#if form?.error}
    <div
        class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6"
    >
        <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
    </div>
{/if}

<ProfileForm {profile} {opts} {dependencyMaps} />
