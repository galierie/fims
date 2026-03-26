<script lang="ts">
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import Icon from '@iconify/svelte';

    interface Props {
        onCancel: () => void;
        acadYears?: number[];
        selectedFaculty?: any[]; 
    }

    const { onCancel, acadYears = [2023, 2024, 2025, 2026, 2027, 2028], selectedFaculty = [] }: Props = $props();

    // Step 1: Settings, Step 2: Download Links
    let step = $state<1 | 2>(1);

    // Form states - Start and End ranges (Initialized to empty strings for placeholders)
    let startAy = $state<number | ''>('');
    let startSem = $state<number | ''>('');
    let endAy = $state<number | ''>('');
    let endSem = $state<number | ''>('');
    
    // Automatically adjust the "To" dates if they become chronologically backward!
    $effect(() => {
        // If "From Year" is pushed past "To Year", bump "To Year" up to match
        if (startAy !== '' && endAy !== '' && startAy > endAy) {
            endAy = startAy;
        }
        
        // If the Years are the same, but "From Sem" is pushed past "To Sem", bump "To Sem" up to match
        if (startAy !== '' && endAy !== '' && startAy === endAy) {
            if (startSem !== '' && endSem !== '' && startSem > endSem) {
                endSem = startSem;
            }
        }
    });

    // Checkboxes - Per Faculty Member
    let exportProfile = $state(false);
    let exportServiceRecord = $state(false);
    let exportLoading = $state(false);
    let exportSetAvg = $state(false);
    let aggregateFaculty = $state(false);
    
    // Checkboxes - Aggregated Course Information
    let exportByFacSubj = $state(false);
    let exportBySubjFac = $state(false);
    let aggregateCourse = $state(false);
    
    let format = $state<'csv' | 'xlsx'>('xlsx');

    const semesters = [
        { id: 1, name: '1st Semester' },
        { id: 2, name: '2nd Semester' },
        { id: 3, name: 'Midyear' },
    ];

    const hasFacultyReports = $derived(exportProfile || exportServiceRecord || exportLoading || exportSetAvg);
    const hasCourseReports = $derived(exportByFacSubj || exportBySubjFac);
    
    // If only Faculty Profile is chosen, no need for acad year/sem
    const isOnlyProfile = $derived(exportProfile && !exportServiceRecord && !exportLoading && !exportSetAvg && !hasCourseReports);
    const hasRanges = $derived(startAy !== '' && startSem !== '' && endAy !== '' && endSem !== '');
    const hasAnyReport = $derived(hasFacultyReports || hasCourseReports);
    
    // Export is disabled if no reports are checked, OR if they need dates and they are missing
    const isExportDisabled = $derived(!hasAnyReport || (!isOnlyProfile && !hasRanges));

    const rangeStr = $derived(`AY${startAy}_Sem${startSem}_to_AY${endAy}_Sem${endSem}`);

    const selectedDownloads = $derived.by(() => {
        const links = [];
        const allFacIds = selectedFaculty.map(f => f.facultyid).join(',');
        
        // If it's only profile, we pass 0s to bypass backend date validation safely if fields are empty
        const safeStartAy = startAy || 0;
        const safeStartSem = startSem || 0;
        const safeEndAy = endAy || 0;
        const safeEndSem = endSem || 0;
        
        const baseParams = `fromAy=${safeStartAy}&fromSem=${safeStartSem}&toAy=${safeEndAy}&toSem=${safeEndSem}&format=${format}`;

        // PER FACULTY REPORTS
        if (hasFacultyReports) {
            const types = [];
            if (exportProfile) types.push('profile');
            if (exportServiceRecord) types.push('service-record');
            if (exportLoading) types.push('loading');
            if (exportSetAvg) types.push('set-avg');
            
            const rangeSuffix = isOnlyProfile ? '' : `_${rangeStr}`;

            if (aggregateFaculty) {
                // Aggregated Faculty Reports
                const fileName = isOnlyProfile ? 'Aggregated_Faculty_Profiles' : `Aggregated_Faculty_Reports${rangeSuffix}`;
                links.push({
                    name: fileName,
                    url: `/api/export?types=${types.join(',')}&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}`
                });
            } else {
                // One File per Faculty
                for (const faculty of selectedFaculty) {
                    const fileName = isOnlyProfile ? `${faculty.lastname}_Faculty_Profile` : `${faculty.lastname}_Reports${rangeSuffix}`;
                    links.push({
                        name: fileName,
                        url: `/api/export?types=${types.join(',')}&facultyIds=${faculty.facultyid}&${baseParams}&fileName=${fileName}`
                    });
                }
            }
        }

        // AGGREGATED COURSE REPORTS
        if (hasCourseReports) {
            const types = [];
            if (exportByFacSubj) types.push('subjects-by-faculty');
            if (exportBySubjFac) types.push('faculty-by-subject');

            if (aggregateCourse) {
                // Aggregated Course Reports for selected course report types
                const fileName = `Aggregated_Course_Info_${rangeStr}`;
                links.push({
                    name: fileName,
                    url: `/api/export?types=${types.join(',')}&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}`
                });
            } else {
                // One File per Course Report Type
                if (exportByFacSubj) {
                    const fileName = `Subjects_Taught_by_Faculty_${rangeStr}`;
                    links.push({ name: fileName, url: `/api/export?types=subjects-by-faculty&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}` });
                }
                if (exportBySubjFac) {
                    const fileName = `Faculty_by_Subject_Taught_${rangeStr}`;
                    links.push({ name: fileName, url: `/api/export?types=faculty-by-subject&facultyIds=${allFacIds}&${baseParams}&fileName=${fileName}` });
                }
            }
        }

        return links;
    });

    function handleExport() { step = 2; }

    function handleDownloadAll() {
        selectedDownloads.forEach((download, index) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = download.url;
                a.download = `${download.name}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, index * 500); 
        });
    }
</script>

<div class="fixed top-0 left-0 z-100 flex h-full w-full items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
    <div class="w-[90%] max-w-3xl rounded-2xl bg-fims-beige px-10 py-10 shadow-xl max-h-[95vh] overflow-y-auto">
        <div class="mb-2 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-fims-green">Export Reports</h2>
            <button onclick={onCancel} class="text-fims-green transition-opacity hover:opacity-70">
                <Icon icon="tabler:x" class="h-6 w-6" />
            </button>
        </div>

        {#if step === 1}
            <p class="mb-8 text-base text-black">Please select the options for the reports you wish to export.</p>

            <div class="space-y-8">
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <span class="w-12 text-base font-semibold text-black">From:</span>
                        <div class="relative w-64">
                            <select bind:value={startAy} class="w-full appearance-none rounded-xl border border-fims-green bg-white px-4 py-2.5 text-black outline-none focus:ring-1 focus:ring-fims-green {startAy === '' ? 'text-gray-500' : ''}">
                                <option value="" disabled selected>Choose Academic Year</option>
                                {#each acadYears as ay}
                                    <option value={ay} class="text-black">AY {ay}-{ay + 1}</option>
                                {/each}
                            </select>
                            <Icon icon="tabler:chevron-down" class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-fims-green" />
                        </div>
                        <div class="relative w-56">
                            <select bind:value={startSem} class="w-full appearance-none rounded-xl border border-fims-green bg-white px-4 py-2.5 text-black outline-none focus:ring-1 focus:ring-fims-green {startSem === '' ? 'text-gray-500' : ''}">
                                <option value="" disabled selected>Choose Semester</option>
                                {#each semesters as sem}
                                    <option value={sem.id} class="text-black">{sem.name}</option>
                                {/each}
                            </select>
                            <Icon icon="tabler:chevron-down" class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-fims-green" />
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <span class="w-12 text-base font-semibold text-black">To:</span>
                        <div class="relative w-64">
                            <select bind:value={endAy} class="w-full appearance-none rounded-xl border border-fims-green bg-white px-4 py-2.5 text-black outline-none focus:ring-1 focus:ring-fims-green {endAy === '' ? 'text-gray-500' : ''}">
                                <option value="" disabled selected>Choose Academic Year</option>
                                {#each acadYears as ay}
                                    <option value={ay} class={startAy !== '' && ay < startAy ? 'text-gray-400' : 'text-black'} disabled={startAy !== '' && ay < startAy}>AY {ay}-{ay + 1}</option>
                                {/each}
                            </select>
                            <Icon icon="tabler:chevron-down" class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-fims-green" />
                        </div>
                        <div class="relative w-56">
                            <select bind:value={endSem} class="w-full appearance-none rounded-xl border border-fims-green bg-white px-4 py-2.5 text-black outline-none focus:ring-1 focus:ring-fims-green {endSem === '' ? 'text-gray-500' : ''}">
                                <option value="" disabled selected>Choose Semester</option>
                                {#each semesters as sem}
                                    <option value={sem.id} class={startAy !== '' && endAy === startAy && startSem !== '' && sem.id < startSem ? 'text-gray-400' : 'text-black'} disabled={startAy !== '' && endAy === startAy && startSem !== '' && sem.id < startSem}>{sem.name}</option>
                                {/each}
                            </select>
                            <Icon icon="tabler:chevron-down" class="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-fims-green" />
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
                    <div>
                        <h3 class="mb-4 text-lg font-bold text-black">Per Faculty Member</h3>
                        <div class="flex flex-col gap-3 pl-2">
                            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportProfile} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">Faculty Profile</span></label>
                            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportServiceRecord} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">Faculty Service Record</span></label>
                            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportLoading} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">Faculty Loading</span></label>
                            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportSetAvg} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">Faculty SET Average</span></label>
                            
                            <hr class="my-2 border-fims-green/20" />
                            <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={aggregateFaculty} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base font-semibold text-fims-green">Aggregate Selected Reports into One File?</span></label>
                        </div>
                    </div>

                    <div class="flex flex-col gap-8">
                        <div>
                            <h3 class="mb-4 text-lg font-bold text-black">Aggregated Course Information</h3>
                            <div class="flex flex-col gap-3 pl-2">
                                <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportByFacSubj} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">By Faculty, Subject Taught</span></label>
                                <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={exportBySubjFac} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">By Subject Taught, Faculty</span></label>

                                <hr class="my-2 border-fims-green/20" />
                                <label class="flex cursor-pointer items-start gap-3"><input type="checkbox" bind:checked={aggregateCourse} class="mt-0.5 h-5 w-5 rounded border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base font-semibold text-fims-green">Aggregate Selected Reports into One File?</span></label>
                            </div>
                        </div>

                        <div>
                            <h3 class="mb-4 text-lg font-bold text-black">File format</h3>
                            <div class="flex flex-col gap-3 pl-2">
                                <label class="flex cursor-pointer items-center gap-3"><input type="radio" name="format" value="csv" bind:group={format} class="h-5 w-5 border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">CSV</span></label>
                                <label class="flex cursor-pointer items-center gap-3"><input type="radio" name="format" value="xlsx" bind:group={format} class="h-5 w-5 border-fims-green text-fims-green focus:ring-fims-green" /><span class="text-base text-black">XLSX</span></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-10 flex justify-end gap-5">
                <button class="cursor-pointer rounded-3xl border-2 border-solid border-fims-green px-7.5 py-2.5 text-base text-fims-green transition-opacity duration-200 hover:opacity-70" onclick={onCancel}>Cancel</button>
                <GreenButton onclick={handleExport} disabled={isExportDisabled}>
                    <Icon icon="tabler:file-export" class="mr-2 h-5 w-5" />
                    <span>Export</span>
                </GreenButton>
            </div>
            
        {:else if step === 2}
            <p class="mb-6 text-base text-black">Your reports are ready for download.</p>

            <div class="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {#each selectedDownloads as download}
                    <div class="flex items-center justify-between rounded-xl border border-fims-green bg-white p-4">
                        <span class="font-medium text-black break-all">{download.name}.{format}</span>
                        <a href={download.url} download="{download.name}.{format}" class="ml-4 flex shrink-0 items-center gap-2 font-semibold text-fims-green transition-opacity hover:opacity-70">
                            <Icon icon="tabler:download" class="h-5 w-5" />
                            <span>Download</span>
                        </a>
                    </div>
                {/each}
            </div>

            <div class="mt-8 flex justify-end gap-5">
                <button class="cursor-pointer rounded-3xl border-2 border-solid border-fims-green px-7.5 py-2.5 text-base text-fims-green transition-opacity duration-200 hover:opacity-70" onclick={onCancel}>Close</button>
                
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