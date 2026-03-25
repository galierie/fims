<script lang="ts">
    import Icon from '@iconify/svelte';
    import InputTable from '../../../../ui/InputTable.svelte';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table';
    import type { FacultyStudyLoadDTO } from '$lib/server/queries/faculty-view';

    interface Props {
        studyLoadCredit: number;
        studyLoad: FacultyStudyLoadDTO;
        hasChange: boolean;
    }

    // eslint-disable-next-line prefer-const -- bindable variable
    let { studyLoadCredit = $bindable(), studyLoad, hasChange = $bindable() }: Props = $props();

    // Input Table Columns
    const studyLoadColumns: InputColumnType[] = [
        {
            label: 'Degree',
            name: 'study-load-degree',
            colSpan: 8,
            type: 'text',
        },
        {
            label: 'University',
            name: 'study-load-university',
            colSpan: 8,
            type: 'text',
        },
        {
            label: 'Study Load Units',
            name: 'study-load-units',
            colSpan: 5,
            type: 'number',
        },
        {
            label: 'On full-time leave with pay?',
            name: 'study-load-on-leave-with-pay',
            colSpan: 5,
            type: 'checkbox',
        },
        {
            label: 'Recipient of faculty fellowship?',
            name: 'study-load-fellowship-recipient',
            colSpan: 5,
            type: 'checkbox',
        },
        {
            label: 'Load Credit',
            name: 'study-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ];

    const studyLoadValues: InputRowValue[] = $derived(
        studyLoad.map(
            (
                {
                    tupleid,
                    degreeProgram,
                    university,
                    studyLoadUnits,
                    onFullTimeLeaveWithPay,
                    isFacultyFellowshipRecipient,
                    studyLoadCredit,
                },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: degreeProgram },
                    { columnNum: 1, defaultValue: university },
                    { columnNum: 2, defaultValue: studyLoadUnits },
                    { columnNum: 3, defaultChecked: onFullTimeLeaveWithPay },
                    { columnNum: 4, defaultChecked: isFacultyFellowshipRecipient },
                    { columnNum: 5, defaultValue: studyLoadCredit },
                ],
                tupleid,
            }),
        ),
    );

    let isVisible = $state(true);

    // Safelist Tailwind classes
    // grid-cols-36
</script>

<div>
    <!-- Section Header -->
    <button
        type="button"
        class="flex h-7.5 w-full items-center border-b-2 border-black/50 px-3 py-2.5"
        onclick={() => (isVisible = !isVisible)}
    >
        {#if isVisible}
            <Icon icon="tabler:chevron-up" class="mr-2 h-5 w-5" />
        {:else}
            <Icon icon="tabler:chevron-right" class="mr-2 h-5 w-5" />
        {/if}
        <span>Study Load</span>
    </button>

    {#if isVisible}
        <div class="my-7 pl-3.5">
            <InputTable
                tableName="study-load"
                rowLabel="Degree Program"
                columns={studyLoadColumns}
                rows={studyLoadValues}
                numOfColumns={36}
                bind:hasChange
            />

            <p class="mt-4 pl-3.5">Total Semester Study Load Credit: {studyLoadCredit}</p>
        </div>
    {/if}
</div>
