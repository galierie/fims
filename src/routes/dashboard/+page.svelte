<script lang="ts">
    const { data } = $props();
</script>

<div class="p-8">
    <h1 class="text-3xl font-bold text-fims-green mb-6">Faculty Management Dashboard</h1>
    
    <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Faculty Records (Task 4)</h2>
        
        {#if data.facultyList && data.facultyList.length > 0}
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b">
                        <th class="py-2">Name</th>
                        <th class="py-2">Department</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.facultyList as faculty}
                        <tr class="border-b">
                            <td class="py-2">{faculty.firstName} {faculty.lastName}</td>
                            <td class="py-2">{faculty.department}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p class="text-gray-500 italic">No faculty records found in the database. Task 4 logic is working, but the table is empty!</p>
        {/if}
    </div>
</div>