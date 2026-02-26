<script lang="ts">
    import type { FacultyRecordDTO } from '$lib/server/faculty-records-list-helpers';

    interface Props {
        facultyRecord: FacultyRecordDTO;
        canViewChangeLogs: boolean;
        isSelected: boolean;
        onToggle: () => void;
    }

    const { facultyRecord, canViewChangeLogs, isSelected, onToggle }: Props = $props();
    const {
        lastname,
        firstname,
        status,
        ranktitle,
        adminposition,
        logTimestamp,
        logMaker,
        logOperation,
    }: FacultyRecordDTO = $derived(facultyRecord);

</script>

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
    <div class={canViewChangeLogs ? 'w-66 2xl:w-132' : 'w-91 2xl:w-182'}>
        <span><button class="hover:cursor-pointer">{lastname}, {firstname}</button></span>
    </div>
    <div class="w-50 justify-center 2xl:w-75"><span>{status}</span></div>
    <div class="w-62.5 justify-center 2xl:w-75"><span>{ranktitle}</span></div>
    <div class="w-62.5 justify-center 2xl:w-75">
        <span>{adminposition ? adminposition : '-'}</span>
    </div>
    {#if canViewChangeLogs}
        <div class="w-50">
            <span class="truncate text-[#535353]">{logMaker} ({logTimestamp}): {logOperation}</span>
        </div>
    {/if}
</div>
