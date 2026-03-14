<script lang="ts">
    import Icon from '@iconify/svelte';
    import InputTable from '../../../../ui/InputTable.svelte';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table';
    import type { FacultyResearchDTO } from '$lib/server/queries/faculty-view';

    interface Props {
        researchLoadCredit: number;
        researchWork: FacultyResearchDTO;
        opts?: Map<string, Array<string>>;
        dependencyMaps?: Map<string, Map<string, string>>;
        hasChange: boolean;
    }

    let {
        researchLoadCredit = $bindable(),
        researchWork,
        opts,
        dependencyMaps,
        hasChange = $bindable(),
    }: Props = $props();

    // Input Table Columns
    const researchTitles = $derived(opts?.get('researchTitles'));
    const researchTitlesToResearchStartDates = $derived(
        dependencyMaps?.get('researchTitlesToResearchStartDates'),
    );
    const researchTitlesToResearchEndDates = $derived(
        dependencyMaps?.get('researchTitlesToResearchEndDates'),
    );
    const researchTitlesToResearchFunding = $derived(
        dependencyMaps?.get('researchTitlesToResearchFunding'),
    );
    const researchColumns: InputColumnType[] = $derived([
        {
            label: 'Title',
            name: 'research-title',
            colSpan: 8,
            type: 'dropdown',
            opts: researchTitles,
        },
        {
            label: 'Start Date',
            name: 'research-start-date',
            colSpan: 3,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: researchTitlesToResearchStartDates,
        },
        {
            label: 'End Date',
            name: 'research-end-date',
            colSpan: 3,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: researchTitlesToResearchEndDates,
        },
        {
            label: 'Funding',
            name: 'research-funding',
            colSpan: 7,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: researchTitlesToResearchFunding,
        },
        {
            label: 'Load Credit',
            name: 'research-load-credit',
            colSpan: 5,
            type: 'number',
        },
        {
            label: 'Remarks',
            name: 'research-remarks',
            colSpan: 9,
            type: 'expandable',
        },
    ]);

    const researchValues: InputRowValue[] = $derived(
        researchWork.map(
            (
                { tupleid, title, startDate, endDate, funding, researchLoadCredit, remarks },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: title ?? undefined },
                    { columnNum: 1, defaultValue: startDate ?? undefined },
                    { columnNum: 2, defaultValue: endDate ?? undefined },
                    { columnNum: 3, defaultValue: funding ?? undefined },
                    { columnNum: 4, defaultValue: researchLoadCredit },
                    { columnNum: 5, defaultValue: remarks ?? undefined },
                ],
                tupleid,
            }),
        ),
    );

    let isVisible = $state(true);

    // Safelist Tailwind classes
    // grid-cols-35
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
        <span>Research/Textbook Writing/Creative Work</span>
    </button>

    {#if isVisible}
        <div class="my-7 pl-3.5">
            <InputTable
                tableName="research"
                rowLabel="Research/Textbook Writing/Creative Work"
                columns={researchColumns}
                rows={researchValues}
                numOfColumns={35}
                bind:hasChange
            />

            <p class="mt-4 pl-3.5">Total Semester Research Load Credit: {researchLoadCredit}</p>
        </div>
    {/if}
</div>
