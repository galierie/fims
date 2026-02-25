<script lang="ts">
    import Icon from '@iconify/svelte';
    import AccountRow from './(ui)/AccountRow.svelte';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import FilterButton from '$lib/ui/FilterButton.svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import SaveConfirmation from '$lib/ui/SaveConfirmation.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import SearchBar from '$lib/ui/SearchBar.svelte';
    import SelectDropdown from '$lib/ui/SelectDropdown.svelte';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    const { data, form } = $props();
    const {
        accountList,
        prevCursor,
        nextCursor,
        hasPrev,
        hasNext,
        filters,
        userRoles,
        searchTerm,
    } = $derived(data);

    let isMakingAccount = $state(false);
    let willMake = $state(false);
    let willBatchDelete = $state(false);
    let isLoading = $state(false);

    function toggleModal() {
        isMakingAccount = !isMakingAccount;
        willMake = !willMake;
    }

    let selectedIds: string[] = $state([]);

    function toggleSelection(id: string) {
        if (selectedIds.includes(id)) selectedIds = selectedIds.filter((i) => i !== id);
        else selectedIds = [...selectedIds, id];
    }

    function selectAll() {
        selectedIds = accountList.map(({ userid }) => userid);
    }

    function deselectAll() {
        selectedIds = [];
    }

    async function goToPage(isNext: boolean = true) {
        isLoading = true;
        const cursor = isNext ? nextCursor : prevCursor;
        const url = new URL(page.url);
        if (cursor) url.searchParams.set('cursor', cursor.toString());
        url.searchParams.set('isNext', isNext ? '1' : '0');
        await goto(url.toString());
        isLoading = false;
    }

    let makeForm: HTMLFormElement | null = $state(null);
    let deleteForm: HTMLFormElement | null = $state(null);
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
            <Icon icon="tabler:check" class="h-6 w-6 text-fims-green" />
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
    <!-- Search Bar -->
    <div class="mt-25 flex justify-center">
        <div class="flex w-315 items-center 2xl:w-432">
            <SearchBar bind:isSearching={isLoading} {searchTerm} />
        </div>
    </div>

    <!-- Filter Buttons -->
    <div class="mt-1 flex justify-center">
        <div class="flex w-315 items-center 2xl:w-432">
            <span class="mr-1">Show:</span>
            {#each filters as { name, filter, opts, selectedOpts } (name)}
                <div class="mr-1">
                    <FilterButton
                        {name}
                        {filter}
                        {opts}
                        {selectedOpts}
                        bind:isFiltering={isLoading}
                    />
                </div>
            {/each}
        </div>
    </div>

    <!-- Show on Row Select -->
    <div class="flex justify-center">
        {#if selectedIds.length > 0}
            <div class="mt-6 flex w-315 justify-between 2xl:w-432">
                <div class="flex gap-2">
                    <GreenButton onclick={selectAll}>Select All</GreenButton>
                    <RedButton onclick={deselectAll}>Deselect Selection</RedButton>
                </div>
                <div>
                    <RedButton onclick={() => (willBatchDelete = true)}>
                        <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                        <span
                            >Delete {selectedIds.length}
                            {selectedIds.length > 1 ? 'Accounts' : 'Account'}</span
                        >
                    </RedButton>
                </div>
            </div>
        {:else if !isMakingAccount}
            <div class="mt-6 flex w-315 justify-end 2xl:w-432">
                <GreenButton onclick={() => (isMakingAccount = true)}>+ Add Account</GreenButton>
            </div>
        {:else}
            <div class="mt-15"></div>
        {/if}
    </div>

    <!-- Account List Table -->
    <div class="mt-2.5">
        <!-- Header -->
        <div
            class="flex justify-center [&>*>span]:text-center [&>*>span]:font-semibold [&>*>span]:text-white [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:bg-fims-red [&>div]:px-6"
        >
            <div class="w-25 justify-center"><span>Select</span></div>
            <div class="w-66 2xl:w-132">
                <span>Email</span>
                <Icon icon="tabler:arrow-up" class="ml-3 h-5 w-5 text-white" />
            </div>
            <div class="w-50 justify-center"><span>Reset Password?</span></div>
            <div class="w-40 justify-center">
                <span>Type</span>
            </div>
            <div class="w-85 justify-center 2xl:w-100"><span>Change Logs</span></div>
            <div class="w-50 justify-center"><span>Account Action</span></div>
        </div>

        <!-- Rows -->
        {#each accountList as account (account.userid)}
            <AccountRow
                {account}
                isSelected={selectedIds.includes(account.userid)}
                onToggle={() => toggleSelection(account.userid)}
            />
        {/each}

        <!-- Account Creation Form -->
        {#if isMakingAccount}
            <form
                method="POST"
                action="?/makeAccount"
                class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
                bind:this={makeForm}
                use:enhance={({ cancel }) => {
                    if (willMake) {
                        isMakingAccount = false;
                        willMake = false;
                        isLoading = true;
                        return async ({ update }) => {
                            await update();
                            await goto(page.url.pathname);
                            isLoading = false;
                        };
                    }
                    willMake = true;
                    cancel();
                }}
            >
                <div class="w-25"></div>
                <div class="w-66 2xl:w-132">
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email here"
                        class="h-full w-full border-0 p-2 focus:ring-0"
                    />
                </div>
                <div class="w-50">
                    <input
                        type="password"
                        name="password"
                        placeholder="Set initial password"
                        class="h-full w-full border-0 p-2 focus:ring-0"
                    />
                </div>
                <div class="w-40">
                    <SelectDropdown name="role" opts={userRoles} selectedOpt={userRoles[0]} />
                </div>
                <div class="w-85 2xl:w-100"></div>
                <div class="w-50 justify-center">
                    <GreenButton type="submit">
                        <Icon icon="tabler:device-floppy" class="mr-2 h-6 w-6" />
                        <span>Save</span>
                    </GreenButton>
                </div>
            </form>
        {/if}
    </div>

    <!-- Pagination Controls -->
    <div class="mt-2 flex justify-center">
        <div class="flex w-315 items-center justify-between 2xl:w-432">
            <GreenButton onclick={() => goToPage(false)} type="button" disabled={!hasPrev}>
                <Icon icon="line-md:arrow-left-circle" class="mr-2 h-5 w-5" />
                <span>Previous</span>
            </GreenButton>
            <GreenButton onclick={() => goToPage(true)} type="button" disabled={!hasNext}>
                <span>Next</span>
                <Icon icon="line-md:arrow-right-circle" class="ml-2 h-5 w-5" />
            </GreenButton>
        </div>
    </div>
</div>

{#if willMake}
    <SaveConfirmation
        onSave={() => {
            if (makeForm) makeForm.requestSubmit();
        }}
        onCancel={toggleModal}
        text="Are you sure you want to save the account?"
    />
{/if}

{#if willBatchDelete}
    <form
        bind:this={deleteForm}
        method="POST"
        action="?/deleteAccounts"
        use:enhance={() => {
            willBatchDelete = false;
            isLoading = true;
            return async ({ update }) => {
                selectedIds = [];
                await update();
                isLoading = false;
            };
        }}
    >
        <input type="hidden" name="userids" value={JSON.stringify(selectedIds)} />

        <DeleteConfirmation
            text={`Are you sure you want to delete ${selectedIds.length} ${selectedIds.length > 1 ? 'accounts' : 'account'}?`}
            onCancel={() => (willBatchDelete = false)}
            onDelete={() => {
                if (deleteForm) deleteForm.requestSubmit();
            }}
        />
    </form>
{/if}

{#if isLoading}
    <LoadingScreen />
{/if}
