<script lang="ts">
    import type { Snippet } from 'svelte';
    import ChangelogEntry from '$lib/ui/ChanglogEntry.svelte';

    export type ChangelogRecordStructure = {
        timestamp: Date;
        email: string;
        info: string;
    };

    type Props = {
        // basically a callback so that the component can be integrated anywhere since im not sure on future changes of this
        // should make it easier to implement pagination as well i think
        changelogFetcher: () => ChangelogRecordStructure[];
    };

    const { changelogFetcher }: Props = $props();
</script>

<div data-testid="changelog-component" class="flex w-90 flex-col">
    <!-- Header -->
    <div class="rounded-t-4xl bg-fims-green text-white">
        <h1 class="w-full py-3 text-center text-3xl font-semibold">Change Logs</h1>
    </div>

    <!-- Entries -->
    <div>
        {#each changelogFetcher() as log}
            <ChangelogEntry timestamp={log.timestamp} email={log.email} info={log.info} />
        {/each}
    </div>
</div>
