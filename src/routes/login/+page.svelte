<script lang="ts">
    const { form } = $props(); // Accesses the "fail" messages from your server logic
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
    <form method="POST" class="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h1 class="text-2xl font-bold mb-6 text-center">Faculty Login</h1>
        
        {#if form?.message}
            <p class="text-red-500 text-sm mb-4 text-center">{form.message}</p>
        {/if}

        <div class="mb-4">
            <label class="block text-sm font-medium mb-1" for="email">UP Email</label>
            <input name="email" id="email" type="email" required 
                class="w-full border p-2 rounded focus:ring-2 focus:ring-green-700 outline-none" 
                placeholder="zdelacruz@up.edu.ph" />
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium mb-1" for="password">Password</label>
            <input name="password" id="password" type="password" required 
                class="w-full border p-2 rounded focus:ring-2 focus:ring-green-700 outline-none" />
        </div>

        <button type="submit" 
            class="w-full bg-green-800 text-white py-2 rounded hover:bg-green-900 transition-colors">
            Log In
        </button>
    </form>
</div>