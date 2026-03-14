<script lang="ts">
    import { onMount } from 'svelte';

    import type { InputColumnType, InputCellValue, InputRowValue } from '$lib/types/input-table';
    import InputTableRow from './InputTableRow.svelte';
    import { viewState } from '../states/view-state.svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';

    interface Props {
        tableName: string;
        rowLabel: string;
        columns: InputColumnType[];
        rows: InputRowValue[];
        numOfColumns: number;
        colStart?: number;
        colSpan?: number;
    }

    // eslint-disable-next-line prefer-const -- changing value
    let { tableName, rowLabel, columns, rows, numOfColumns, colStart, colSpan }: Props = $props();

    let nextRowNum = $derived(rows.length);
    const haveValues: boolean[] = $derived(Array(nextRowNum).fill(true));

    let actualRows: InputRowValue[] = $derived(rows);
    let deletedRows: number[] = $state([]);

    function toggleRowDeletion(rowNum: number) {
        const [row] = actualRows.filter((r) => r.rowNum === rowNum);
        if (deletedRows.includes(rowNum)) deletedRows = deletedRows.filter((r) => r !== rowNum);
        else if (haveValues[rowNum] || row.tupleid !== undefined)
            deletedRows = [...deletedRows, rowNum];
        else actualRows = actualRows.filter((r) => r.rowNum !== rowNum);
    }

    function addRow() {
        const newRow: InputCellValue[] = [];
        for (let c = 0; c < columns.length; c++) newRow.push({ columnNum: c });

        actualRows = [...actualRows, { rowNum: nextRowNum, row: newRow }];
        nextRowNum++;
    }

    const gridTemplateColumns = $derived(`grid-cols-${numOfColumns}`);
    const colStartClass = $derived(colStart === undefined ? '' : `col-start-${colStart}`);
    const colSpanClass = $derived(colSpan === undefined ? '' : `col-span-${colSpan}`);
    const buttonDivColSpanClass = $derived(`col-span-${numOfColumns}`);

    // Hacky way of preventing FOUC
    let domContainer: HTMLDivElement | null = $state(null);
    onMount(() => {
        if (domContainer) domContainer.classList.remove('hidden');
    });

    $effect(() => {
        if (!viewState.isEditing) {
            deletedRows = [];
            actualRows = rows;
        }
    });

    // Safelist Tailwind classes

    // grid-cols-2
    // grid-cols-3
    // grid-cols-4
    // grid-cols-5
    // grid-cols-6
    // grid-cols-7
    // grid-cols-8
    // grid-cols-9
    // grid-cols-10

    // col-span-2
    // col-span-3
    // col-span-4
    // col-span-5
    // col-span-6
    // col-span-7
    // col-span-8
    // col-span-9
    // col-span-10
</script>

<div class="px-4 {colStartClass} {colSpanClass} hidden" bind:this={domContainer}>
    <div class="grid {gridTemplateColumns}">
        {#each columns as { label, colSpan: cellColSpan } (label)}
            {@const cellColSpanClass = `col-span-${cellColSpan}`}
            <div
                class="h-8 bg-fims-green text-white {cellColSpanClass} flex items-center justify-center"
            >
                <span class="text-center font-semibold">{label}</span>
            </div>
        {/each}
    </div>

    {#each actualRows as { rowNum, row, tupleid } (tupleid !== undefined ? `db-${tupleid}` : `new-${rowNum}`)}
        <div class="relative">
            {#if tupleid !== undefined}
                <input type="hidden" name={`${tableName}-${rowNum}-tupleid`} value={tupleid} />
            {/if}

            <InputTableRow
                {columns}
                {row}
                {numOfColumns}
                {rowNum}
                {tupleid}
                toggleRowDeletion={() => toggleRowDeletion(rowNum)}
                isDeleted={deletedRows.includes(rowNum)}
                bind:hasValue={haveValues[rowNum]}
            />
        </div>
    {/each}

    {#if viewState.isEditing}
        <div class="mt-2 {buttonDivColSpanClass}">
            <GreenButton type="button" onclick={addRow}>+ Add {rowLabel}</GreenButton>
        </div>
    {/if}
</div>

<input type="hidden" name="{tableName}-deletion" value={JSON.stringify(deletedRows)} />
<input type="hidden" name="{tableName}-num-of-rows" value={nextRowNum} />
