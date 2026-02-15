<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import DeleteConfirmation from './DeleteConfirmation.svelte';

    interface AccountDTO {
        email: string;
        role: string | null;
        userid: string;
        logTimestamp: Date | null;
        logOperation: string | null;
        logMaker: string | null;
    }

    interface Props {
        account: AccountDTO;
    }

    const { account }: Props = $props();
    const { email, role, userid, logTimestamp, logOperation, logMaker }: AccountDTO =
        $derived(account);

    const userRoles = ['Admin', 'IT'];

    let willDelete = $state(false);

    function toggleModal() {
        willDelete = !willDelete;
    }

    let deleteForm: HTMLFormElement | null = null;
</script>

<div
    class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
>
    <div class="w-25 justify-center"><input type="checkbox" class="h-5 w-5" /></div>
    <div class="w-132"><span>{email}</span></div>
    <div class="w-50 justify-center">
        <form method="POST" action="?/deleteAccount" class="flex items-center justify-center">
            <button
                type="submit"
                name="userid"
                value={userid}
                class="flex items-center justify-center rounded-full border-2 border-fims-red bg-white px-4 py-1 text-fims-red hover:bg-fims-red hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
            >
                <Icon icon="tabler:refresh" class="mr-2 h-6 w-6" />
                <span>Reset</span>
            </button>
        </form>
    </div>
    <div class="w-75">
        <form method="POST" action="" class="w-full">
            <select name="role" class="w-full text-center">
                {#each userRoles as userRole (userRole)}
                    {#if userRole === role}
                        <option value={userRole} selected>{userRole}</option>
                    {:else}
                        <option value={userRole}>{userRole}</option>
                    {/if}
                {/each}
            </select>
        </form>
    </div>
    <div class="w-100">
        <span class="truncate text-[#535353]">{logMaker} ({logTimestamp}): {logOperation}</span>
    </div>
    <div class="w-50 justify-center">
        <form
            method="POST"
            action="?/deleteAccount"
            class="flex items-center justify-center"
            bind:this={deleteForm}
            use:enhance
        >
            <button
                class="flex items-center justify-center rounded-full border-2 border-fims-red bg-white px-4 py-1 text-fims-red hover:bg-fims-red hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
                onclick={(event) => {
                    event.preventDefault();
                    toggleModal();
                }}
            >
                <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                <span>Delete</span>
            </button>

            <input type="hidden" name="userid" value={userid} />

            {#if willDelete}
                <DeleteConfirmation
                    onDelete={() => {
                        if (deleteForm) deleteForm.submit();
                    }}
                    onCancel={toggleModal}
                />
            {/if}
        </form>
    </div>
</div>
