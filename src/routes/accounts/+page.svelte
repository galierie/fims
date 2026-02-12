<script lang="ts">
    import Icon from '@iconify/svelte';
    import AccountRow from './(ui)/AccountRow.svelte';
    import SaveConfirmation from './(ui)/SaveConfirmation.svelte';
    import { enhance } from '$app/forms';
    const { data, form } = $props();
    const { accountList } = $derived(data);

    let isMakingAccount = $state(false);
    let willMake = $state(false);

    function toggleModal() {
        willMake = !willMake;
    }

    let makeForm: HTMLFormElement | null = null;

    const userRoles = ['Admin', 'IT'];
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
    <!-- Make/Save Account Button -->
    <div class="flex justify-end pr-22">
        {#if isMakingAccount}
            <button
                onclick={toggleModal}
                class="mt-50 flex items-center justify-center rounded-full border-2 border-fims-green bg-white px-4 py-1 text-fims-green hover:bg-fims-green hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
                >+ Save Account</button
            >
        {:else}
            <button
                onclick={() => (isMakingAccount = true)}
                class="mt-50 flex items-center justify-center rounded-full border-2 border-fims-green bg-white px-4 py-1 text-fims-green hover:bg-fims-green hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
                >+ Add Account</button
            >
        {/if}
    </div>

    <!-- Account List Table -->
    <div class="mt-2.5">
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

        <!-- Account Creation Form -->
        {#if isMakingAccount}
            <form
                method="POST"
                action="?/makeAccount"
                class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
                bind:this={makeForm}
                use:enhance
            >
                <div class="w-25"></div>
                <div class="w-132">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        class="h-full w-full p-2"
                    />
                </div>
                <div class="w-50">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        class="h-full w-full p-2"
                    />
                </div>
                <div class="w-75">
                    <select name="role" class="w-full text-center">
                        {#each userRoles as userRole (userRole)}
                            <option value={userRole}>{userRole}</option>
                        {/each}
                    </select>
                </div>
                <div class="w-100"></div>
                <div class="w-50"></div>
            </form>
        {/if}
    </div>
</div>

{#if willMake}
    <SaveConfirmation
        onSave={() => {
            if (makeForm) makeForm.submit();
        }}
        onCancel={toggleModal}
    />
{/if}
