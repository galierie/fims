<script lang="ts">
    import type { InputColumnType, InputCellValue } from '$lib/types/input-table';
    import ExpandableCell from './ExpandableCell.svelte';
    import SelectDropdownCell from '$lib/ui/SelectDropdownCell.svelte';
    import { viewState } from '../states/view-state.svelte';
    import Icon from '@iconify/svelte';

    interface Props {
        columns: InputColumnType[];
        row: InputCellValue[];
        numOfColumns: number;
        isDeleted: boolean;
        toggleRowDeletion: () => void;
        hasValue: boolean;
        rowNum: number;
        tupleid?: number;
        hasChange: boolean;
    }

    let {
        // eslint-disable-next-line prefer-const -- bindable variable
        columns,
        // eslint-disable-next-line prefer-const -- bindable variable
        row,
        // eslint-disable-next-line prefer-const -- bindable variable
        numOfColumns,
        // eslint-disable-next-line prefer-const -- bindable variable
        isDeleted,
        // eslint-disable-next-line prefer-const -- bindable variable
        toggleRowDeletion,

        hasValue = $bindable(),
        // eslint-disable-next-line prefer-const -- bindable variable
        rowNum,
        // eslint-disable-next-line prefer-const -- bindable variable
        tupleid,
        hasChange = $bindable(),
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    const values: any[] = $state(
        row.map((r) => {
            if (columns[r.columnNum].type === 'checkbox') return r.defaultChecked ?? false;
            return r.defaultValue !== undefined && r.defaultValue !== null ? r.defaultValue : '';
        }),
    );

    $effect(() => {
        hasValue = values.some(
            (v) =>
                v !== undefined &&
                v !== null &&
                v !== '' &&
                v !== false &&
                String(v) !== 'undefined',
        );
    });

    // Check for changes
    // svelte-ignore state_referenced_locally
    const haveChanges: boolean[] = $state(Array(row.length).fill(false));
    $effect(() => {
        hasChange = haveChanges.some((e) => e === true);
    });
    $effect(() => {
        if (!viewState.isEditing) {
            const newValues = row.map((r) => {
                if (columns[r.columnNum].type === 'checkbox') return r.defaultChecked ?? false;
                return r.defaultValue !== undefined && r.defaultValue !== null
                    ? r.defaultValue
                    : '';
            });

            for (let i = 0; i < newValues.length; i++) values[i] = newValues[i];

            for (let i = 0; i < haveChanges.length; i++) haveChanges[i] = false;
        }
    });

    const gridTemplateColumns = $derived(`grid-cols-${numOfColumns}`);

    // Safelist Tailwind classes

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

<div class="relative grid {gridTemplateColumns}" data-testid="list-table-input">
    {#each row as { columnNum, defaultValue, defaultChecked } (columnNum)}
        {@const colSpanClass = `col-span-${columns[columnNum].colSpan}`}
        {@const { type } = columns[columnNum]}
        {@const name = `${rowNum}[${columns[columnNum].name}]`}
        {@const { isImmutable } = columns[columnNum]}
        {@const { opts } = columns[columnNum]}
        {@const { isRequired } = columns[columnNum]}
        {@const dependentOnValue =
            columns[columnNum].dependentOn === undefined
                ? undefined
                : values[columns[columnNum].dependentOn] === undefined
                  ? row[columns[columnNum].dependentOn].defaultValue
                  : values[columns[columnNum].dependentOn]}
        {@const { dependencyMap } = columns[columnNum]}

        {#if type === 'dropdown' && opts !== undefined && !(defaultValue instanceof Date)}
            <div
                class="{colSpanClass} h-8 bg-white {isDeleted
                    ? 'text-fims-gray'
                    : ''} flex items-center"
            >
                <SelectDropdownCell
                    {name}
                    {opts}
                    bind:selectedOpt={values[columnNum]}
                    defaultSelectedOpt={(defaultValue as string) ?? '-'}
                    isEditable={viewState.isEditing &&
                        (!isImmutable || defaultValue === undefined || defaultValue === '') &&
                        !isDeleted}
                    bind:hasChange={haveChanges[columnNum]}
                    isRequired={isRequired &&
                        hasValue &&
                        (tupleid === undefined || hasChange) &&
                        !isDeleted}
                />
            </div>
        {:else if type === 'expandable' && !(defaultValue instanceof Date)}
            <div class={colSpanClass}>
                <ExpandableCell
                    {name}
                    defaultValue={defaultValue as string}
                    {isDeleted}
                    bind:value={values[columnNum]}
                    onchange={() => {
                        haveChanges[columnNum] = values[columnNum] !== defaultValue;
                    }}
                />
            </div>
        {:else if type === 'dependent' && dependencyMap !== undefined}
            <div
                class="h-full w-full {colSpanClass} flex items-center justify-center bg-white {isDeleted
                    ? 'text-fims-gray'
                    : 'text-black'}"
            >
                <span
                    >{dependentOnValue === undefined || dependentOnValue === ''
                        ? ''
                        : dependencyMap.get(dependentOnValue as string)}</span
                >
            </div>
        {:else if type === 'checkbox'}
            <div class="{colSpanClass} flex h-8 w-full items-center justify-center bg-white py-0">
                <input
                    type="checkbox"
                    {name}
                    disabled={!viewState.isEditing ||
                        (isImmutable && defaultValue !== undefined && defaultValue !== '') ||
                        isDeleted}
                    class="h-5 w-5 rounded-sm checked:bg-fims-gray focus:ring-0"
                    bind:checked={values[columnNum]}
                    defaultChecked={defaultChecked ?? false}
                    onchange={() => {
                        haveChanges[columnNum] = values[columnNum] !== defaultChecked;
                    }}
                />
                <input type="hidden" {name} defaultValue={false} />
            </div>
        {:else if type === 'datalist' && opts !== undefined && !(defaultValue instanceof Date)}
            <div
                class="{colSpanClass} h-8 bg-white {isDeleted
                    ? 'text-fims-gray'
                    : ''} flex items-center"
            >
                <SelectDropdownCell
                    {name}
                    {opts}
                    bind:selectedOpt={values[columnNum]}
                    defaultSelectedOpt={(defaultValue as string) ?? '-'}
                    isEditable={viewState.isEditing &&
                        (!isImmutable || defaultValue === undefined || defaultValue === '') &&
                        !isDeleted}
                    bind:hasChange={haveChanges[columnNum]}
                    isRequired={isRequired &&
                        !isDeleted &&
                        ((tupleid === undefined && hasValue) ||
                            (tupleid !== undefined && hasChange))}
                    isCombobox={true}
                />
            </div>
        {:else if type !== 'dropdown'}
            <input
                {type}
                {name}
                class="{colSpanClass} h-8 w-full border-0 focus:ring-0 {isDeleted
                    ? 'text-fims-gray'
                    : ''} py-0"
                disabled={!viewState.isEditing ||
                    (isImmutable && defaultValue !== undefined && defaultValue !== '') ||
                    isDeleted}
                defaultValue={(defaultValue as string) ?? ''}
                bind:value={values[columnNum]}
                required={isRequired &&
                    !isDeleted &&
                    ((tupleid === undefined && hasValue) || (tupleid !== undefined && hasChange))}
                onchange={() => {
                    haveChanges[columnNum] = values[columnNum] !== defaultValue;
                }}
            />
        {/if}
    {/each}

    {#if viewState.isEditing}
        <button type="button" class="absolute top-1.5 -right-5.5 ml-1" onclick={toggleRowDeletion}>
            {#if isDeleted}
                <Icon icon="tabler:arrow-back-up-double" class="h-5 w-5 text-fims-green" />
            {:else}
                <Icon icon="tabler:trash" class="h-5 w-5 text-fims-red" />
            {/if}
        </button>
    {/if}
</div>
