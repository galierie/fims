<script lang="ts">
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import Icon from '@iconify/svelte';
    import { fade, scale } from 'svelte/transition';

    interface Props {
        onCancel: () => void;
        acadYears?: number[];
        selectedFaculty?: any[];
    }

    const {
        onCancel,
        acadYears = [2023, 2024, 2025, 2026, 2027, 2028],
        selectedFaculty = [],
    }: Props = $props();

    // Step 1: Settings, Step 2: Download Links
    let step = $state<1 | 2>(1);

    // Form states
    let startAy = $state<number | ''>('');
    let startSem = $state<number | ''>('');
    let endAy = $state<number | ''>('');
    let endSem = $state<number | ''>('');

    $effect(() => {
        if (startAy !== '' && endAy !== '' && startAy > endAy) endAy = startAy;
        if (startAy !== '' && endAy !== '' && startAy === endAy)
            if (startSem !== '' && endSem !== '' && startSem > endSem) endSem = startSem;
    });

    // Overview Reports (No Dates)
    let exportProfile = $state(false);
    let exportBySubjFac = $state(false);

    // Period-Specific Reports (Needs Dates)
    let exportServiceRecord = $state(false);
    let exportLoading = $state(false);
    let exportSetAvg = $state(false);
    let exportByFacSubj = $state(false);

    // File Options
    let aggregateFacultyReports = $state(false);
    let aggregateCourseReports = $state(false);
    let format = $state<'csv' | 'xlsx'>('xlsx');

    $effect(() => {
        if (format === 'csv') {
            aggregateFacultyReports = false;
            aggregateCourseReports = false;
        }
    });

    const semesters = [
        { id: 1, name: 'Sem 1' },
        { id: 2, name: 'Sem 2' },
        { id: 3, name: 'Midyear' },
    ];

    const noFacultySelected = $derived(selectedFaculty.length === 0);

    const hasDateDependentReports = $derived(
        exportServiceRecord || exportLoading || exportSetAvg || exportByFacSubj,
    );
    const hasDateIndependentReports = $derived(exportProfile || exportBySubjFac);
    const hasAnyReport = $derived(hasDateDependentReports || hasDateIndependentReports);
    const hasRanges = $derived(startAy !== '' && startSem !== '' && endAy !== '' && endSem !== '');

    // Export is disabled if no reports are selected, or if date-dependent reports are selected but dates are incomplete
    const isExportDisabled = $derived(!hasAnyReport || (hasDateDependentReports && !hasRanges));
    const rangeStr = $derived(
        startAy === endAy && startSem === endSem
            ? `AY${startAy}_Sem${startSem}`
            : `AY${startAy}_Sem${startSem}-AY${endAy}_Sem${endSem}`,
    );

    interface Download {
        name: string;
        url: string;
    }

    let selectedDownloads: Download[] = $state([]);

    function handleExport() {
        step = 2;

        const links = [];
        const allFacIds = selectedFaculty.map((f) => f.facultyid || f.id).join(',');

        const safeStartAy = startAy || 0;
        const safeStartSem = startSem || 0;
        const safeEndAy = endAy || 0;
        const safeEndSem = endSem || 0;
        const baseParams = `fromAy=${safeStartAy}&fromSem=${safeStartSem}&toAy=${safeEndAy}&toSem=${safeEndSem}&format=${format}`;

        const facTypes = [];
        if (exportProfile) facTypes.push('profile');
        if (exportServiceRecord) facTypes.push('service-record');
        if (exportLoading) facTypes.push('loading');
        if (exportSetAvg) facTypes.push('set-avg');

        const courseTypes = [];
        if (exportBySubjFac) courseTypes.push('faculty-by-subject');
        if (exportByFacSubj) courseTypes.push('subjects-by-faculty');

        const hasFacDateDependent = exportServiceRecord || exportLoading || exportSetAvg;
        const facSuffix = hasFacDateDependent ? `_${rangeStr}` : '';

        const hasCourseDateDependent = exportByFacSubj;
        const courseSuffix = hasCourseDateDependent ? `_${rangeStr}` : '';

        let facReportTitle = 'CombinedReports';
        if (facTypes.length === 1) 
            if (exportProfile) facReportTitle = 'Profile';
            else if (exportServiceRecord) facReportTitle = 'ServiceRecord';
            else if (exportLoading) facReportTitle = 'Loading';
            else if (exportSetAvg) facReportTitle = 'SETAverage';
        

        // FACULTY REPORTS ROUTING
        if (facTypes.length > 0) 
            if (aggregateFacultyReports) {
                const fileName = `AggregatedFacultyReports${facSuffix}`;
                links.push({
                    name: fileName,
                    url: `/api/export?types=${facTypes.join(',')}&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}`,
                });
            } else {
                for (const faculty of selectedFaculty) {
                    const fName = faculty.firstname || faculty.firstName || '';
                    const lName = faculty.lastname || faculty.lastName || 'Unknown';
                    const namePrefix = fName ? `${lName}_${fName}` : lName;
                    const fileName = `${namePrefix}-${facReportTitle}${facSuffix}`;
                    links.push({
                        name: fileName,
                        url: `/api/export?types=${facTypes.join(',')}&facultyIds=${faculty.facultyid || faculty.id}&${baseParams}&fileName=${fileName}`,
                    });
                }
            }
        

        // COURSE INFORMATION ROUTING
        if (courseTypes.length > 0) 
            if (aggregateCourseReports) {
                let courseReportTitle = `AggregatedCourseReports${courseSuffix}`;
                if (courseTypes.length === 1) {
                    if (exportBySubjFac) courseReportTitle = 'By_Subject_Faculty_Taught';
                    if (exportByFacSubj)
                        courseReportTitle = `SelectedFaculty_BySubjectTaught${courseSuffix}`;
                }

                links.push({
                    name: courseReportTitle,
                    url: `/api/export?types=${courseTypes.join(',')}&facultyIds=${allFacIds}&${baseParams}&fileName=${courseReportTitle}`,
                });
            } else {
                if (exportBySubjFac) {
                    const fileName = `By_Subject_Faculty_Taught`;
                    links.push({
                        name: fileName,
                        url: `/api/export?types=faculty-by-subject&fileName=${fileName}`,
                    });
                }
                if (exportByFacSubj) {
                    const fileName = `SelectedFaculty_BySubjectTaught${courseSuffix}`;
                    links.push({
                        name: fileName,
                        url: `/api/export?types=subjects-by-faculty&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}`,
                    });
                }
            }
        
        return links;
    }

    function handleDownloadAll() {
        selectedDownloads.forEach((download, index) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = download.url;
                a.download = `${download.name}.${format}`;
                a.setAttribute('data-sveltekit-reload', '');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, index * 500);
        });
    }
</script>

<div
    transition:fade={{ duration: 150 }}
    class="fixed top-0 left-0 z-100 flex h-full w-full items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
>
    <div
        transition:scale={{ duration: 150, start: 0.95 }}
        class="custom-scrollbar max-h-[95vh] w-[90%] max-w-3xl overflow-y-auto rounded-2xl bg-fims-beige px-10 py-10 shadow-2xl"
    >
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-fims-green">Export Reports</h2>
            <button
                onclick={onCancel}
                class="text-fims-green transition-all hover:opacity-70 active:scale-95"
            >
                <Icon icon="tabler:x" class="h-6 w-6" />
            </button>
        </div>

        {#if step === 1}
            <div class="space-y-6">
                <div class="rounded-xl border border-fims-green/20 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-lg font-bold text-fims-green">Overview Reports</h3>
                    <div class="flex flex-col gap-3 pl-2">
                        <label
                            class="flex items-start gap-3 {noFacultySelected
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'}"
                        >
                            <input
                                type="checkbox"
                                bind:checked={exportProfile}
                                disabled={noFacultySelected}
                                class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                            />
                            <span class="text-base text-black"
                                >Faculty Profile <span class="text-sm text-gray-400"
                                    >(Selected Faculty)</span
                                ></span
                            >
                        </label>
                        <label class="flex cursor-pointer items-start gap-3">
                            <input
                                type="checkbox"
                                bind:checked={exportBySubjFac}
                                class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green"
                            />
                            <span class="text-base text-black"
                                >By Subject, Faculty Taught <span class="text-sm text-gray-400"
                                    >(All Records)</span
                                ></span
                            >
                        </label>
                    </div>
                </div>

                <div class="rounded-xl border border-fims-green/20 bg-white p-6 shadow-sm">
                    <h3 class="mb-4 text-lg font-bold text-fims-green">Period-Specific Reports</h3>

                    <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
                        <div class="flex flex-col gap-3 pl-2 md:col-span-5">
                            <label
                                class="flex items-start gap-3 {noFacultySelected
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'}"
                            >
                                <input
                                    type="checkbox"
                                    bind:checked={exportServiceRecord}
                                    disabled={noFacultySelected}
                                    class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                                />
                                <span class="text-base text-black">Faculty Service Record</span>
                            </label>
                            <label
                                class="flex items-start gap-3 {noFacultySelected
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'}"
                            >
                                <input
                                    type="checkbox"
                                    bind:checked={exportLoading}
                                    disabled={noFacultySelected}
                                    class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                                />
                                <span class="text-base text-black">Faculty Loading</span>
                            </label>
                            <label
                                class="flex items-start gap-3 {noFacultySelected
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'}"
                            >
                                <input
                                    type="checkbox"
                                    bind:checked={exportSetAvg}
                                    disabled={noFacultySelected}
                                    class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                                />
                                <span class="text-base text-black">Faculty SET Average</span>
                            </label>
                            <label
                                class="flex items-start gap-3 {noFacultySelected
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'}"
                            >
                                <input
                                    type="checkbox"
                                    bind:checked={exportByFacSubj}
                                    disabled={noFacultySelected}
                                    class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                                />
                                <span class="text-base text-black">By Faculty, Subject Taught</span>
                            </label>
                        </div>

                        <div
                            class="flex flex-col justify-center rounded-lg bg-[#e9e9e9] p-4 transition-all duration-300 {hasDateDependentReports
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-40'} md:col-span-7"
                        >
                            <div class="flex flex-col gap-4">
                                <div class="flex items-center gap-2">
                                    <span class="w-12 shrink-0 text-sm font-semibold text-black"
                                        >From:</span
                                    >

                                    <div class="relative w-[55%]">
                                        <select
                                            bind:value={startAy}
                                            class="w-full appearance-none rounded-md border border-fims-green bg-white bg-none py-1.5 pr-7 pl-3 text-sm outline-none focus:ring-1 focus:ring-fims-green {startAy ===
                                            ''
                                                ? 'text-gray-500'
                                                : 'text-black'}"
                                        >
                                            <option value="" disabled selected class="text-gray-500"
                                                >AY</option
                                            >
                                            {#each acadYears as ay}<option
                                                    value={ay}
                                                    class="text-black"
                                                    >AY {ay}-{ay + 1 - 2000}</option
                                                >{/each}
                                        </select>
                                        <Icon
                                            icon="tabler:chevron-down"
                                            class="pointer-events-none absolute top-2 right-2 h-4 w-4 text-fims-green"
                                        />
                                    </div>

                                    <div class="relative w-[45%]">
                                        <select
                                            bind:value={startSem}
                                            class="w-full appearance-none rounded-md border border-fims-green bg-white bg-none py-1.5 pr-7 pl-3 text-sm outline-none focus:ring-1 focus:ring-fims-green {startSem ===
                                            ''
                                                ? 'text-gray-500'
                                                : 'text-black'}"
                                        >
                                            <option value="" disabled selected class="text-gray-500"
                                                >Sem</option
                                            >
                                            {#each semesters as sem}<option
                                                    value={sem.id}
                                                    class="text-black">{sem.name}</option
                                                >{/each}
                                        </select>
                                        <Icon
                                            icon="tabler:chevron-down"
                                            class="pointer-events-none absolute top-2 right-2 h-4 w-4 text-fims-green"
                                        />
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="w-12 shrink-0 text-sm font-semibold text-black"
                                        >To:</span
                                    >

                                    <div class="relative w-[55%]">
                                        <select
                                            bind:value={endAy}
                                            class="w-full appearance-none rounded-md border border-fims-green bg-white bg-none py-1.5 pr-7 pl-3 text-sm outline-none focus:ring-1 focus:ring-fims-green {endAy ===
                                            ''
                                                ? 'text-gray-500'
                                                : 'text-black'}"
                                        >
                                            <option value="" disabled selected class="text-gray-500"
                                                >AY</option
                                            >
                                            {#each acadYears as ay}
                                                <option
                                                    value={ay}
                                                    disabled={startAy !== '' && ay < startAy}
                                                    class={startAy !== '' && ay < startAy
                                                        ? 'text-gray-400'
                                                        : 'text-black'}
                                                >
                                                    AY {ay}-{ay + 1 - 2000}
                                                </option>
                                            {/each}
                                        </select>
                                        <Icon
                                            icon="tabler:chevron-down"
                                            class="pointer-events-none absolute top-2 right-2 h-4 w-4 text-fims-green"
                                        />
                                    </div>

                                    <div class="relative w-[45%]">
                                        <select
                                            bind:value={endSem}
                                            class="w-full appearance-none rounded-md border border-fims-green bg-white bg-none py-1.5 pr-7 pl-3 text-sm outline-none focus:ring-1 focus:ring-fims-green {endSem ===
                                            ''
                                                ? 'text-gray-500'
                                                : 'text-black'}"
                                        >
                                            <option value="" disabled selected class="text-gray-500"
                                                >Sem</option
                                            >
                                            {#each semesters as sem}
                                                <option
                                                    value={sem.id}
                                                    disabled={startAy !== '' &&
                                                        endAy === startAy &&
                                                        startSem !== '' &&
                                                        sem.id < startSem}
                                                    class={startAy !== '' &&
                                                    endAy === startAy &&
                                                    startSem !== '' &&
                                                    sem.id < startSem
                                                        ? 'text-gray-400'
                                                        : 'text-black'}
                                                >
                                                    {sem.name}
                                                </option>
                                            {/each}
                                        </select>
                                        <Icon
                                            icon="tabler:chevron-down"
                                            class="pointer-events-none absolute top-2 right-2 h-4 w-4 text-fims-green"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="flex flex-col gap-5 rounded-xl border border-fims-green/20 bg-white p-6 shadow-sm"
                >
                    <div class="flex flex-col gap-3">
                        <label
                            class="flex items-start gap-3 {format === 'csv' || noFacultySelected
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'}"
                        >
                            <input
                                type="checkbox"
                                bind:checked={aggregateFacultyReports}
                                disabled={format === 'csv' || noFacultySelected}
                                class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                            />
                            <span class="text-base font-semibold text-fims-green"
                                >Aggregate Faculty Reports <span
                                    class="text-sm font-normal text-gray-400"
                                    >(Faculty Profile, Faculty Service Record, Faculty Loading,
                                    and/or Faculty SET Average)</span
                                ></span
                            >
                        </label>

                        <label
                            class="flex items-start gap-3 {format === 'csv' || noFacultySelected
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'}"
                        >
                            <input
                                type="checkbox"
                                bind:checked={aggregateCourseReports}
                                disabled={format === 'csv' || noFacultySelected}
                                class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green disabled:border-gray-300 disabled:bg-gray-200"
                            />
                            <span class="text-base font-semibold text-fims-green"
                                >Aggregate Course Info Reports <span
                                    class="text-sm font-normal text-gray-400"
                                    >(By Faculty, Subject Taught and/or By Subject Taught, Faculty)</span
                                ></span
                            >
                        </label>
                    </div>

                    <hr class="border-fims-green/20" />

                    <div class="flex items-center gap-4">
                        <span class="text-base font-semibold text-black">Format:</span>
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="format"
                                value="xlsx"
                                bind:group={format}
                                class="h-4 w-4 border-fims-green text-fims-green focus:ring-fims-green"
                            />
                            <span class="text-sm text-black">XLSX</span>
                        </label>
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name="format"
                                value="csv"
                                bind:group={format}
                                class="h-4 w-4 border-fims-green text-fims-green focus:ring-fims-green"
                            />
                            <span class="text-sm text-black">CSV</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="mt-8 flex justify-end gap-4">
                <button
                    class="rounded-3xl border-2 border-fims-green px-7 py-2 font-medium text-fims-green transition-all hover:opacity-70 active:scale-95"
                    onclick={onCancel}>Cancel</button
                >
                <GreenButton onclick={() => { selectedDownloads = handleExport() }} disabled={isExportDisabled}>
                    <Icon icon="tabler:file-export" class="mr-2 h-5 w-5" />
                    <span>Export</span>
                </GreenButton>
            </div>
        {:else if step === 2}
            <p class="mb-6 text-base text-black">Your reports are ready for download.</p>
            <div class="custom-scrollbar max-h-96 space-y-3 overflow-y-auto pr-2">
                {#each selectedDownloads as download}
                    <div
                        class="flex items-center justify-between rounded-xl border border-fims-green bg-white p-4"
                    >
                        <span class="font-medium break-all text-black"
                            >{download.name}.{format}</span
                        >
                        <a
                            href={download.url}
                            download="{download.name}.{format}"
                            data-sveltekit-reload
                            class="ml-4 flex shrink-0 items-center gap-2 font-semibold text-fims-green transition-all hover:opacity-70 active:scale-95"
                        >
                            <Icon icon="tabler:download" class="h-5 w-5" />
                            <span>Download</span>
                        </a>
                    </div>
                {/each}
            </div>
            <div class="mt-8 flex justify-end gap-5">
                <button
                    class="rounded-3xl border-2 border-fims-green px-7 py-2 font-medium text-fims-green transition-all hover:opacity-70 active:scale-95"
                    onclick={onCancel}>Close</button
                >
                {#if selectedDownloads.length > 1}
                    <GreenButton onclick={handleDownloadAll}>
                        <Icon icon="tabler:download" class="mr-2 h-5 w-5" />
                        <span>Download All</span>
                    </GreenButton>
                {/if}
            </div>
        {/if}
    </div>
</div>
