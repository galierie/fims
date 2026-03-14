<script lang="ts">
    import { goto } from '$app/navigation';
    import Icon from '@iconify/svelte';

    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';

    import {
        chooseSemestralRecord,
        chosenSemestralRecord,
    } from '../../../states/chosen-semestral-record.svelte';
    import { viewState } from '../../../states/view-state.svelte';

    interface Props {
        acadYearOpts: number[];
        allSemStrs: string[];
        existingOpts: Array<{ acadYear: number | null; semNum: number | null }>;
        facultyid: number;
    }

    const { acadYearOpts, allSemStrs, existingOpts, facultyid }: Props = $props();

    let isAcadYearDropdownOpen = $state(false);
    let isSemNumDropdownOpen = $state(false);
    let isLoading = $state(false);
    let isMakingSemestralRecord = $state(false);
    let newAcadYear: number = $state(chosenSemestralRecord.acadYear + 1);
    let stagedAcadYear: number | null = $state(null);

    const displayAcadYear = $derived(
        isMakingSemestralRecord
            ? newAcadYear
            : stagedAcadYear !== null
              ? stagedAcadYear
              : chosenSemestralRecord.acadYear,
    );

    const semOpts = $derived(
        existingOpts
            .filter(({ acadYear }) => acadYear === displayAcadYear)
            .map(({ semNum }) => semNum),
    );

    async function goToPage(ay: number, sem: number) {
        isLoading = true;
        isAcadYearDropdownOpen = false;
        isSemNumDropdownOpen = false;
        isMakingSemestralRecord = false;
        stagedAcadYear = null;

        await goto(`/faculty/${facultyid}/${ay}/${sem}`);
        isLoading = false;
    }

    const borderColor = $derived(viewState.isEditing ? 'border-fims-gray' : 'border-fims-green');
    const textColor = $derived(viewState.isEditing ? 'text-fims-gray' : 'text-fims-green');
    const selectedColor = $derived(viewState.isEditing ? 'text-fims-gray' : 'text-fims-green');
</script>

<div class="flex items-center gap-2">
    <div class="relative w-fit">
        <button
            type="button"
            class="flex items-center justify-center border px-4 py-1 {borderColor} rounded-full bg-white"
            onclick={() => {
                if (!viewState.isEditing) {
                    isAcadYearDropdownOpen = !isAcadYearDropdownOpen;
                    if (isAcadYearDropdownOpen) isSemNumDropdownOpen = false;
                }
            }}
        >
            <span class="mr-1 {textColor}">Academic Year:</span>
            <span class={selectedColor}>{displayAcadYear} - {Number(displayAcadYear) + 1}</span>

            <Icon
                icon={isAcadYearDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                class="h-5 w-5 {textColor}"
            />
        </button>

        {#if !viewState.isEditing}
            <div
                class="rounded-lg p-1 {isAcadYearDropdownOpen
                    ? 'block'
                    : 'hidden'} absolute z-50 w-full bg-white shadow-lg"
            >
                <!-- Make new semestral record for faculty member -->
                {#if isMakingSemestralRecord}
                    <div class="flex w-full items-center justify-between rounded-sm p-3">
                        <div class="flex items-center">
                            <input
                                type="number"
                                bind:value={newAcadYear}
                                class="mr-1 w-20 rounded-lg border-2 border-fims-green bg-white focus:ring-0"
                            />
                            <span>- {Number(newAcadYear) + 1}</span>
                        </div>
                        <button
                            type="button"
                            class="group ml-2 text-fims-green"
                            onclick={() => {
                                isAcadYearDropdownOpen = false;
                                isSemNumDropdownOpen = true;
                            }}
                        >
                            <Icon
                                icon="tabler:circle-arrow-right"
                                class="block h-6 w-6 group-hover:hidden"
                            />
                            <Icon
                                icon="tabler:circle-arrow-right-filled"
                                class="hidden h-6 w-6 group-hover:block"
                            />
                        </button>
                    </div>
                {:else}
                    <button
                        type="button"
                        class="group flex w-full items-center rounded-sm p-3 text-fims-green hover:bg-[#e9e9e9]"
                        onclick={() => (isMakingSemestralRecord = true)}
                    >
                        <div class="flex w-8 pr-2">
                            <Icon
                                icon="tabler:circle-plus"
                                class="block h-6 w-6 group-hover:hidden"
                            />
                            <Icon
                                icon="tabler:circle-plus-filled"
                                class="hidden h-6 w-6 group-hover:block"
                            />
                        </div>
                        <span>Add Academic Year</span>
                    </button>
                {/if}

                <!-- Academic Years with Existing Faculty Records -->
                {#key displayAcadYear}
                    {#each acadYearOpts as opt (opt)}
                        {#if opt === displayAcadYear}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                onclick={() => {
                                    isAcadYearDropdownOpen = false;
                                    isSemNumDropdownOpen = true; // Auto-open the next step!
                                }}
                            >
                                <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                                <span>{opt} - {opt + 1}</span>
                            </button>
                        {:else}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                onclick={() => {
                                    stagedAcadYear = opt;
                                    isMakingSemestralRecord = false;
                                    isAcadYearDropdownOpen = false;
                                    isSemNumDropdownOpen = true;
                                }}
                            >
                                <div class="w-8 pr-2"></div>
                                <span>{opt} - {opt + 1}</span>
                            </button>
                        {/if}
                    {/each}
                {/key}
            </div>
        {/if}
    </div>

    <!-- Semester Number -->
    <div class="relative w-fit">
        <button
            type="button"
            class="flex items-center justify-center border px-4 py-1 {borderColor} rounded-full bg-white"
            onclick={() => {
                if (!viewState.isEditing) {
                    isSemNumDropdownOpen = !isSemNumDropdownOpen;
                    if (isSemNumDropdownOpen) isAcadYearDropdownOpen = false;
                }
            }}
        >
            <span class="mr-1 {textColor}">Semester:</span>

            <span class={selectedColor}>{allSemStrs[chosenSemestralRecord.semNum]}</span>

            <Icon
                icon={isSemNumDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                class="h-5 w-5 {textColor}"
            />
        </button>

        {#if !viewState.isEditing}
            <div
                class="rounded-lg p-1 {isSemNumDropdownOpen
                    ? 'block'
                    : 'hidden'} absolute z-50 w-full bg-white shadow-lg"
            >
                {#key chosenSemestralRecord.semNum}
                    {#each allSemStrs as opt, index (opt)}
                        {#if index === chosenSemestralRecord.semNum && displayAcadYear === chosenSemestralRecord.acadYear}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                onclick={() => (isSemNumDropdownOpen = false)}
                            >
                                <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                                <span>{opt}</span>
                            </button>
                        {:else if semOpts.includes(index)}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                onclick={() => goToPage(displayAcadYear, index)}
                            >
                                <div class="w-8 pr-2"></div>
                                <span>{opt}</span>
                            </button>
                        {:else}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 text-fims-green hover:bg-[#e9e9e9]"
                                onclick={() => goToPage(displayAcadYear, index)}
                            >
                                <span class="w-8 pr-2">+</span>
                                <span>{opt}</span>
                            </button>
                        {/if}
                    {/each}
                {/key}
            </div>
        {/if}
    </div>
</div>

{#if isLoading}
    <LoadingScreen />
{/if}
