<script lang="ts">
    import { goto } from '$app/navigation';
    import Icon from '@iconify/svelte';

    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';

    import { chooseSemestralRecord, chosenSemestralRecord } from '../../../states/chosen-semestral-record.svelte';
    import { viewState } from '../../../states/view-state.svelte';

    interface Props {
        acadYearOpts: number[];
        allSemStrs: string[];
        existingOpts: Array<{ acadYear: number | null, semNum: number | null }>;
        facultyid: number;
    }

    const { acadYearOpts, allSemStrs, existingOpts, facultyid }: Props = $props();

    let isAcadYearDropdownOpen = $state(false);
    let isSemNumDropdownOpen = $state(false);
    let isLoading = $state(false);

    let semOpts = $derived(
        existingOpts
            .filter(({ acadYear }) => acadYear === chosenSemestralRecord.acadYear)
            .map(({ semNum }) => semNum)
    )

    async function goToPage(ay: number, sem: number) {
        isLoading = true;
        await goto(`/faculty/${facultyid}/${ay}/${sem}`);
        isLoading = false;
    }

    const borderColor = $derived(viewState.isEditing ? 'border-fims-gray' : 'border-fims-green');
    const textColor = $derived(
        viewState.isEditing
            ? 'text-fims-gray'
            : 'text-fims-green'
    );
    const selectedColor = $derived(viewState.isEditing ? 'text-fims-gray' : 'text-fims-green');

    let isMakingSemestralRecord = $state(false);
    let newAcadYear: number = $state(chosenSemestralRecord.acadYear + 1);
</script>

<div class="flex items-center gap-2">
    <!-- Academic Year -->
    <div class="relative w-fit">
        <button
            type="button"
            class="flex items-center justify-center border px-4 py-1 {borderColor} rounded-full bg-white"
            onclick={() => {
                if (!viewState.isEditing) isAcadYearDropdownOpen = !isAcadYearDropdownOpen;
            }}
        >
            <span class="mr-1 {textColor}">Academic Year:</span>

            <span class={selectedColor}>{chosenSemestralRecord.acadYear} - {chosenSemestralRecord.acadYear + 1}</span>

            <Icon
                icon={isAcadYearDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                class="h-5 w-5 {textColor}"
            />
        </button>

        {#if !viewState.isEditing}
            <div
                class="rounded-lg p-1 {isAcadYearDropdownOpen || isMakingSemestralRecord
                    ? 'block'
                    : 'hidden'} absolute z-50 w-full bg-white shadow-lg"
            >
                <!-- Make new semestral record for faculty member -->
                {#if isMakingSemestralRecord}
                    <div class="flex w-full items-center rounded-sm p-3">
                        <input type="text" bind:value={newAcadYear} class="w-20 rounded-lg bg-white border-fims-green border-2 mr-1 focus:ring-0" />
                        <span>- {newAcadYear + 1}</span>
                    </div>
                {:else}
                    <button
                        type="button"
                        class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9] text-fims-green"
                        onclick={() => (isMakingSemestralRecord = true)}
                    >
                        <span class="w-8 pr-2">+</span>
                        <span>Add Academic Year</span>
                    </button>
                {/if}
                
                <!-- Academic Years with Existing Faculty Records -->
                {#key chosenSemestralRecord.acadYear}
                    {#each acadYearOpts as opt (opt)}
                        {#if opt === chosenSemestralRecord.acadYear}
                            <p class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]">
                                <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                                <span>{opt} - {opt + 1}</span>
                            </p>
                        {:else}
                            <button
                                type="button"
                                class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                onclick={async () => {
                                    chooseSemestralRecord(opt, chosenSemestralRecord.semNum);
                                    await goToPage(opt, chosenSemestralRecord.semNum);
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
                if (!viewState.isEditing) isSemNumDropdownOpen = !isSemNumDropdownOpen;
            }}
        >
            <span class="mr-1 {textColor}">Semester:</span>

            <span class={selectedColor}>{allSemStrs[chosenSemestralRecord.semNum]}</span>

            <Icon
                icon={isSemNumDropdownOpen || isMakingSemestralRecord ? 'tabler:chevron-up' : 'tabler:chevron-down'}
                class="h-5 w-5 {textColor}"
            />
        </button>

        {#if !viewState.isEditing}
            <div
                class="rounded-lg p-1 {isSemNumDropdownOpen || isMakingSemestralRecord
                    ? 'block'
                    : 'hidden'} absolute z-50 w-full bg-white shadow-lg"
            >
                {#if isMakingSemestralRecord}
                    {#each allSemStrs as opt (opt)}
                        <button
                            type="button"
                            class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9] text-fims-green"
                            onclick={async () => {
                                chooseSemestralRecord(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                                await goToPage(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                            }}
                        >
                            <span class="w-8 pr-2">+</span>
                            <span>{opt}</span>
                        </button>
                    {/each}
                {:else}
                    {#key chosenSemestralRecord.semNum}
                        {#each allSemStrs as opt (opt)}
                            {#if allSemStrs.indexOf(opt) === chosenSemestralRecord.semNum}
                                <p class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]">
                                    <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                                    <span>{opt}</span>
                                </p>
                            {:else if semOpts.includes(allSemStrs.indexOf(opt))}
                                <button
                                    type="button"
                                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                                    onclick={async () => {
                                        chooseSemestralRecord(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                                        await goToPage(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                                    }}
                                >
                                    <div class="w-8 pr-2"></div>
                                    <span>{opt}</span>
                                </button>
                            {:else}
                                <button
                                    type="button"
                                    class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9] text-fims-green"
                                    onclick={async () => {
                                        chooseSemestralRecord(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                                        await goToPage(chosenSemestralRecord.acadYear, allSemStrs.indexOf(opt));
                                    }}
                                >
                                    <span class="w-8 pr-2">+</span>
                                    <span>{opt}</span>
                                </button>
                            {/if}
                        {/each}
                    {/key}
                {/if}
            </div>
        {/if}
    </div>
</div>

{#if isLoading}
    <LoadingScreen />
{/if}
