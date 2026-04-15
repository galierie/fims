<script lang="ts">
    import Icon from '@iconify/svelte';
    import InputTable from '../../../../ui/InputTable.svelte';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table';
    import type {
        FacultyAdminPositionDTO,
        FacultyCommitteesDTO,
        FacultyAdminWorksDTO,
    } from '$lib/server/queries/faculty-view';

    interface Props {
        administrativeLoadCredit: number;
        adminPositions: FacultyAdminPositionDTO;
        committees: FacultyCommitteesDTO;
        adminWorks: FacultyAdminWorksDTO;
        opts?: Map<string, Array<string>>;
        hasChange: boolean;
    }

    let {
        administrativeLoadCredit = $bindable(),
        // eslint-disable-next-line prefer-const -- bindable variable
        adminPositions,
        // eslint-disable-next-line prefer-const -- bindable variable
        committees,
        // eslint-disable-next-line prefer-const -- bindable variable
        adminWorks,
        // eslint-disable-next-line prefer-const -- bindable variable
        opts,
        hasChange = $bindable(),
    }: Props = $props();

    $effect(() => {
        const posSum = adminPositions.reduce(
            (acc, curr) => acc + Number(curr.administrativeLoadCredit ?? 0),
            0,
        );
        const comSum = committees.reduce(
            (acc, curr) => acc + Number(curr.administrativeLoadCredit ?? 0),
            0,
        );
        const workSum = adminWorks.reduce(
            (acc, curr) => acc + Number(curr.administrativeLoadCredit ?? 0),
            0,
        );
        administrativeLoadCredit = posSum + comSum + workSum;
    });

    // Check for changes
    const haveChanges: boolean[] = $state(Array(3).fill(false));
    $effect(() => {
        hasChange = haveChanges.some((e) => e === true);
    });

    // Input Table Columns
    const adminPositionOpts = $derived(opts?.get('adminPositions'));
    const offices = $derived(opts?.get('offices'));
    const administrativePositionColumns: InputColumnType[] = $derived([
        {
            label: 'Position',
            name: 'administrative-position-title',
            colSpan: 8,
            type: 'dropdown',
            opts: adminPositionOpts,
        },
        {
            label: 'Office/Unit',
            name: 'administrative-position-office',
            colSpan: 8,
            type: 'dropdown',
            opts: offices,
        },
        {
            label: 'Start Date',
            name: 'administrative-position-start-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'End Date',
            name: 'administrative-position-end-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'Load Credit',
            name: 'administrative-position-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ]);

    const administrativePositionValues: InputRowValue[] = $derived(
        adminPositions.map(
            (
                { tupleid, adminPosition, office, startDate, endDate, administrativeLoadCredit },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: adminPosition ?? undefined },
                    { columnNum: 1, defaultValue: office ?? undefined },
                    { columnNum: 2, defaultValue: startDate },
                    { columnNum: 3, defaultValue: endDate },
                    { columnNum: 4, defaultValue: administrativeLoadCredit },
                ],
                tupleid,
            }),
        ),
    );

    const committeeMembershipColumns: InputColumnType[] = [
        {
            label: 'Nature of Membership',
            name: 'committee-membership-nature',
            colSpan: 8,
            type: 'text',
        },
        {
            label: 'Committee',
            name: 'committee-membership-committee',
            colSpan: 8,
            type: 'text',
        },
        {
            label: 'Start Date',
            name: 'committee-membership-start-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'End Date',
            name: 'committee-membership-end-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'Load Credit',
            name: 'committee-membership-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ];

    const committeeMembershipValues: InputRowValue[] = $derived(
        committees.map(
            (
                { tupleid, membership, committee, startDate, endDate, administrativeLoadCredit },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: membership },
                    { columnNum: 1, defaultValue: committee },
                    { columnNum: 2, defaultValue: startDate },
                    { columnNum: 3, defaultValue: endDate },
                    { columnNum: 4, defaultValue: administrativeLoadCredit },
                ],
                tupleid,
            }),
        ),
    );

    const administrativeWorkColumns: InputColumnType[] = $derived([
        {
            label: 'Nature of Administrative Work',
            name: 'administrative-work-nature',
            colSpan: 8,
            type: 'text',
        },
        {
            label: 'Office/Unit',
            name: 'administrative-work-committee',
            colSpan: 8,
            type: 'dropdown',
            opts: offices,
        },
        {
            label: 'Start Date',
            name: 'administrative-work-start-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'End Date',
            name: 'administrative-work-end-date',
            colSpan: 3,
            type: 'date',
            isRequired: true,
        },
        {
            label: 'Load Credit',
            name: 'administrative-work-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ]);

    const administrativeWorkValues: InputRowValue[] = $derived(
        adminWorks.map(
            (
                { tupleid, natureOfWork, office, startDate, endDate, administrativeLoadCredit },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: natureOfWork },
                    { columnNum: 1, defaultValue: office ?? undefined },
                    { columnNum: 2, defaultValue: startDate },
                    { columnNum: 3, defaultValue: endDate },
                    { columnNum: 4, defaultValue: administrativeLoadCredit },
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
        <span>Admin</span>
    </button>

    {#if isVisible}
        <div class="my-7 pl-3.5">
            <div>
                <span class="pl-4">Administrative Positions</span>
                <InputTable
                    tableName="administrative-positions"
                    rowLabel="Position"
                    columns={administrativePositionColumns}
                    rows={administrativePositionValues}
                    numOfColumns={27}
                    bind:hasChange={haveChanges[0]}
                />
            </div>

            <div class="mt-4">
                <span class="pl-4">Committee Memberships</span>
                <InputTable
                    tableName="committee-memberships"
                    rowLabel="Committee Membership"
                    columns={committeeMembershipColumns}
                    rows={committeeMembershipValues}
                    numOfColumns={27}
                    bind:hasChange={haveChanges[1]}
                />
            </div>

            <div class="mt-4">
                <span class="pl-4">Other Administrative Work</span>
                <InputTable
                    tableName="administrative-works"
                    rowLabel="Administrative Work"
                    columns={administrativeWorkColumns}
                    rows={administrativeWorkValues}
                    numOfColumns={27}
                    bind:hasChange={haveChanges[2]}
                />
            </div>

            <p class="mt-4 pl-3.5">
                Total Semester Administrative Load Credit: {administrativeLoadCredit}
            </p>
        </div>
    {/if}
</div>
