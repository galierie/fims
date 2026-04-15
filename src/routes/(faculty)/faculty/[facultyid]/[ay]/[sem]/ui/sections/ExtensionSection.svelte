<script lang="ts">
    import Icon from '@iconify/svelte';
    import InputTable from '../../../../ui/InputTable.svelte';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table';
    import type { FacultyExtensionDTO } from '$lib/server/queries/faculty-view';

    interface Props {
        extensionLoadCredit: number;
        extensionWork: FacultyExtensionDTO;
        hasChange: boolean;
    }

    let {
        extensionLoadCredit = $bindable(),
        extensionWork,
        hasChange = $bindable(),
    }: Props = $props();

    $effect(() => {
        extensionLoadCredit = extensionWork.reduce(
            (acc, curr) => acc + Number(curr.extensionLoadCredit ?? 0),
            0,
        );
    });

    // Input Table Columns
    const extensionColumns: InputColumnType[] = [
        {
            label: 'Nature of Extension Work/Community Service',
            name: 'extension-nature',
            colSpan: 8,
            type: 'text',
            isRequired: true,
        },
        {
            label: 'Agency',
            name: 'extension-agency',
            colSpan: 8,
            type: 'text',
            isRequired: true,
        },
        {
            label: 'Start Date',
            name: 'extension-start-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'End Date',
            name: 'extension-end-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'Load Credit',
            name: 'extension-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ];

    const extensionValues: InputRowValue[] = $derived(
        extensionWork.map(
            (
                { tupleid, natureOfExtension, agency, startDate, endDate, extensionLoadCredit },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: natureOfExtension },
                    { columnNum: 1, defaultValue: agency },
                    { columnNum: 2, defaultValue: startDate },
                    { columnNum: 3, defaultValue: endDate },
                    { columnNum: 4, defaultValue: extensionLoadCredit },
                ],
                tupleid,
            }),
        ),
    );

    let isVisible = $state(true);

    // Safelist Tailwind classes
    // grid-cols-27
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
        <span>Extension and Community Service</span>
    </button>

    {#if isVisible}
        <div class="my-7 pl-3.5">
            <InputTable
                tableName="extension"
                rowLabel="Extension Work/Community Service"
                columns={extensionColumns}
                rows={extensionValues}
                numOfColumns={27}
                bind:hasChange
            />

            <p class="mt-4 pl-3.5">Total Semester Extension Load Credit: {extensionLoadCredit}</p>
        </div>
    {/if}
</div>
