<script lang="ts">
    import type { Snippet } from 'svelte';
    import ChangelogEntry from '$lib/ui/ChangelogEntry.svelte';

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

<div class="flex w-full justify-center pt-15 pb-50">
    <div data-testid="changelog-component" class="flex w-7xl flex-col">
        <!-- Header -->
        <div class="rounded-t-4xl bg-fims-green text-white">
            <h1 class="w-full py-3 text-center text-3xl font-semibold">Change Logs</h1>
        </div>

        <!-- Entries -->
        <div>
            {#each changelogFetcher() as log}
                <ChangelogEntry timestamp={log.timestamp} email={log.email} info={log.info} />
            {:else}
                <div class="h-12.5 bg-gray-100 flex items-center justify-center">
                    <span>No actions done yet.</span>
                </div>
            {/each}
        </div>
    </div>
</div>
