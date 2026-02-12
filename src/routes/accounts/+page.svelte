<script>
    import Icon from '@iconify/svelte';
    import AccountRow from './(ui)/AccountRow.svelte';
    const { data, form } = $props();
    const { accountList } = $derived(data);
</script>

{#if form?.error}
    <div
        class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6"
    >
        <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
    </div>
{/if}

<br />

{#if form?.message}
    {#if form?.success}
        <div
            class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-fims-green bg-fims-green-100 px-4 py-6"
        >
            <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-green" />
            <p class="px-8">{form.message}</p>
        </div>
    {:else}
        <div
            class="fixed right-3 bottom-3 flex h-8 w-125 items-center rounded-lg border-2 border-[#ceb676] bg-fims-beige px-4 py-6"
        >
            <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-[#ceb676]" />
            <p class="px-8">{form.message}</p>
        </div>
    {/if}
{/if}

<div>
    <!-- Account List Table -->
    <div class="mt-60">
        <!-- Header -->
        <div
            class="flex justify-center [&>*>span]:text-center [&>*>span]:font-semibold [&>*>span]:text-white [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:bg-fims-red [&>div]:px-6"
        >
            <div class="w-25 justify-center"><span>Select</span></div>
            <div class="w-132">
                <span>Email</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-50 justify-center"><span>Reset Password?</span></div>
            <div class="w-75 justify-center">
                <span>Type</span>
            </div>
            <div class="w-100 justify-center"><span>Change Logs</span></div>
            <div class="w-50 justify-center"><span>Account Action</span></div>
        </div>

        <!-- Rows -->
        {#each accountList as account (account.userid)}
            <AccountRow {account} />
        {/each}
    </div>
</div>

<form method="POST" action="?/makeAccount" class="mt-20">
    <input
        type="email"
        name="email"
        placeholder="Email"
        class="h-12 w-50 rounded-lg border-2 p-1"
    />
    <input
        type="password"
        name="password"
        placeholder="Password"
        class="h-12 w-50 rounded-lg border-2 p-1"
    />
    <input type="role" name="role" placeholder="Role" class="h-12 w-35 rounded-lg border-2 p-1" />
    <button
        type="submit"
        class="h-12 w-25 rounded-lg border-2 border-fims-green text-fims-green hover:bg-fims-green-100"
        >Submit</button
    >
</form>
