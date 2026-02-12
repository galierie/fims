<script lang="ts">
    const { data } = $props();
</script>

<div class="p-8">
    <h1 class="mb-6 text-3xl font-bold text-fims-green">Faculty Management Dashboard</h1>

    <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">Faculty Records (Task 4)</h2>

        {#if data.facultyList && data.facultyList.length > 0}
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr class="border-b">
                        <th class="py-2">Name</th>
                        <th class="py-2">Department</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- {#each data.facultyList as faculty}
                        <tr class="border-b">
                            <td class="py-2">{faculty.firstName} {faculty.lastName}</td>
                            <td class="py-2">{faculty.department}</td>
                        </tr>
                    {/each} -->
                </tbody>
            </table>
        {:else}
            <p class="text-gray-500 italic">
                No faculty records found in the database. Task 4 logic is working, but the table is
                empty!
            </p>
        {/if}
    </div>
</div>
