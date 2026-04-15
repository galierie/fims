<script lang="ts">
    import type { FacultyListDTO } from '$lib/server/queries/faculty-list';

    interface Props {
        facultyRecord: FacultyListDTO;
        canViewChangelogs: boolean;
        isSelected: boolean;
        onToggle: () => void;
    }

    const { facultyRecord, canViewChangelogs, isSelected, onToggle }: Props = $props();
    const {
        id,
        lastName,
        firstName,
        status,
        rankTitle,
        adminPosition,
        logTimestamp,
        logMaker,
        logOperation,
    }: FacultyListDTO = $derived(facultyRecord);
</script>

{#if id !== null}
    <div
        class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
    >
        <div class="w-25 justify-center">
            <input
                type="checkbox"
                checked={isSelected}
                onchange={onToggle}
                class="h-5 w-5 rounded-sm checked:bg-fims-gray focus:ring-0"
            />
        </div>
        <a
            href="/faculty/{id}"
            class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
        >
            <div class={canViewChangelogs ? 'w-66 2xl:w-132' : 'w-116 2xl:w-182'}>
                <span class="truncate">{lastName}, {firstName}</span>
            </div>
            <div class="w-50 justify-center 2xl:w-75"><span>{status}</span></div>
            <div class="w-62.5 justify-center 2xl:w-75"><span>{rankTitle}</span></div>
            <div class="w-62.5 justify-center 2xl:w-75">
                <span class="truncate">{adminPosition ? adminPosition : '-'}</span>
            </div>
        </a>
        {#if canViewChangelogs}
            <div class="w-50">
                <span class="truncate text-[#535353]"
                    >{logMaker} ({logTimestamp}): {logOperation}</span
                >
            </div>
        {/if}
    </div>
{/if}
