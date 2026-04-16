<script lang="ts">
    import { goto } from '$app/navigation';
    import GreenButton from '$lib/ui/GreenButton.svelte';

    const { data } = $props();
    const facultyid = $derived(data.facultyid);

    // initialize input with system's latest AY/S from the database
    // svelte-ignore state_referenced_locally
    let acadYear = $state(data.systemLatestAcadYear);
    // svelte-ignore state_referenced_locally
    let semNum = $state(data.systemLatestSemNum);

    function handleProceed(e: Event) {
        e.preventDefault();
        goto(`/faculty/${facultyid}/${acadYear}/${semNum}`);
    }
</script>

<div class="mt-8.5 h-fit w-full rounded-2xl bg-white p-8">
    <h2 class="text-2xl font-semibold text-fims-green">Create Initial Semestral Record</h2>
    <p class="mt-2 text-black">
        This faculty member does not have any semestral records yet. Choose the academic year and
        semester to start.
    </p>

    <form class="mt-6 flex w-full max-w-md flex-col gap-6" onsubmit={handleProceed}>
        <div class="flex flex-col">
            <label for="acadYear" class="font-medium text-black">Academic Year</label>
            <input
                type="number"
                id="acadYear"
                bind:value={acadYear}
                required
                class="mt-2 h-10 w-full rounded-lg border-0 bg-[#e9e9e9] p-2.5 focus:ring-0"
            />
        </div>

        <div class="flex flex-col">
            <label for="semNum" class="font-medium text-black">Semester</label>
            <select
                id="semNum"
                bind:value={semNum}
                class="mt-2 h-10 w-full rounded-lg border-0 bg-[#e9e9e9] p-2.5 focus:ring-0"
            >
                <option value={1}>1st Semester</option>
                <option value={2}>2nd Semester</option>
                <option value={3}>Midyear</option>
            </select>
        </div>

        <div class="mt-2 flex justify-start">
            <GreenButton type="submit">Proceed to Record</GreenButton>
        </div>
    </form>
</div>
