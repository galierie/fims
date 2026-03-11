<script lang="ts">
    import Icon from '@iconify/svelte';
    import InputTable from '../../../../ui/InputTable.svelte';
    import type { InputColumnType, InputRowValue } from '$lib/types/input-table';
    import type {
        FacultyCoursesTaughtDTO,
        FacultyMenteesDTO,
    } from '$lib/server/queries/faculty-view';

    interface Props {
        teachingLoadCredit: number;
        coursesTaught: FacultyCoursesTaughtDTO;
        mentees: FacultyMenteesDTO;
        opts?: Map<string, Array<string>>;
        dependencyMaps?: Map<string, Map<string, string>>;
    }

    let {
        teachingLoadCredit = $bindable(),
        // eslint-disable-next-line prefer-const -- bindable variable
        coursesTaught,
        // eslint-disable-next-line prefer-const -- bindable variable
        mentees,
        // eslint-disable-next-line prefer-const -- bindable variable
        opts,
        // eslint-disable-next-line prefer-const -- bindable variable
        dependencyMaps,
    }: Props = $props();

    // Input Table Columns
    const courseTitles = $derived(opts?.get('courseTitles'));
    const courseTitlesToCourseUnits = $derived(dependencyMaps?.get('courseTitlesToCourseUnits'));
    const courseColumns: InputColumnType[] = $derived([
        {
            label: 'Course',
            name: 'course-title',
            colSpan: 3,
            type: 'dropdown',
            opts: courseTitles,
        },
        {
            label: 'Units',
            name: 'course-units',
            colSpan: 3,
            type: 'dependent',
            dependentOn: 0,
            dependencyMap: courseTitlesToCourseUnits,
        },
        {
            label: 'Section',
            name: 'course-section',
            colSpan: 4,
            type: 'text',
        },
        {
            label: 'Number of Students',
            name: 'course-num-of-students',
            colSpan: 4,
            type: 'number',
        },
        {
            label: 'Load Credit',
            name: 'course-load-credit',
            colSpan: 5,
            type: 'number',
        },
        {
            label: 'SET',
            name: 'course-section-set',
            colSpan: 3,
            type: 'number',
        },
    ]);

    const courseValues: InputRowValue[] = $derived(
        coursesTaught.map(
            (
                {
                    tupleid,
                    title,
                    units,
                    section,
                    numberOfStudents,
                    teachingLoadCredit,
                    sectionSET,
                },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: title ?? undefined },
                    { columnNum: 1, defaultValue: units?.toString() ?? undefined },
                    { columnNum: 2, defaultValue: section ?? undefined },
                    { columnNum: 3, defaultValue: numberOfStudents?.toString() ?? undefined },
                    { columnNum: 4, defaultValue: teachingLoadCredit },
                    { columnNum: 5, defaultValue: sectionSET ?? undefined },
                ],
                tupleid,
            }),
        ),
    );

    const menteeColumns: InputColumnType[] = [
        {
            label: 'Mentee Last Name',
            name: 'mentee-lastname',
            colSpan: 4,
            type: 'text',
        },
        {
            label: 'Mentee First Name',
            name: 'mentee-firstname',
            colSpan: 4,
            type: 'text',
        },
        {
            label: 'Mentee Middle Name',
            name: 'mentee-middlename',
            colSpan: 4,
            type: 'text',
        },
        {
            label: 'Category',
            name: 'mentee-category',
            colSpan: 4,
            type: 'text',
        },
        {
            label: 'Start Date',
            name: 'mentee-start-date',
            colSpan: 3,
            type: 'date',
        },
        {
            label: 'End Date',
            name: 'mentee-end-date',
            colSpan: 3,
            type: 'date',
        },
        {
            label: 'Load Credit',
            name: 'mentee-load-credit',
            colSpan: 5,
            type: 'number',
        },
    ];

    const menteeValues: InputRowValue[] = $derived(
        mentees.map(
            (
                {
                    tupleid,
                    lastName,
                    middleName,
                    firstName,
                    category,
                    startDate,
                    endDate,
                    teachingLoadCredit,
                },
                index,
            ) => ({
                rowNum: index,
                row: [
                    { columnNum: 0, defaultValue: lastName ?? undefined },
                    { columnNum: 1, defaultValue: firstName ?? undefined },
                    { columnNum: 2, defaultValue: middleName ?? undefined },
                    { columnNum: 3, defaultValue: category ?? undefined },
                    { columnNum: 4, defaultValue: startDate },
                    { columnNum: 5, defaultValue: endDate },
                    { columnNum: 6, defaultValue: teachingLoadCredit },
                ],
                tupleid,
            }),
        ),
    );

    let isVisible = $state(true);

    // Safelist Tailwind classes
    // grid-cols-22
    // grid-cols-31
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
        <span>Teaching</span>
    </button>

    {#if isVisible}
        <div class="my-7 pl-3.5">
            <div>
                <span class="pl-4">Classes Taught</span>
                <InputTable
                    tableName="courses"
                    rowLabel="Class"
                    columns={courseColumns}
                    rows={courseValues}
                    numOfColumns={22}
                />
            </div>

            <div class="mt-4">
                <span class="pl-4">Mentoring</span>
                <InputTable
                    tableName="mentees"
                    rowLabel="Mentee"
                    columns={menteeColumns}
                    rows={menteeValues}
                    numOfColumns={31}
                />
            </div>

            <p class="mt-4 pl-3.5">Total Semester Teaching Load Credit: {teachingLoadCredit}</p>
        </div>
    {/if}
</div>
