<script lang="ts">
    import { enhance } from '$app/forms';
    import Button from '$lib/ui/Button.svelte';
    import Icon from '@iconify/svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';
    import SelectDropdown from '$lib/ui/SelectDropdown.svelte';

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
    let isDeleting = $state(false);

    function toggleModal() {
        willDelete = !willDelete;
    }

    let deleteForm: HTMLFormElement | null = null;
</script>

<div
    class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
>
    <div class="w-25 justify-center">
        <input type="checkbox" class="h-5 w-5 rounded-sm checked:bg-fims-gray focus:ring-0" />
    </div>
    <div class="w-66 2xl:w-132"><span>{email}</span></div>
    <div class="w-50 justify-center">
        <form method="POST" action="?/deleteAccount" class="flex items-center justify-center">
            <Button type="submit" name="userid" value={userid} color="red">
                <Icon icon="tabler:refresh" class="mr-2 h-6 w-6" />
                <span>Reset</span>
            </Button>
        </form>
    </div>
    <div class="w-75">
        <form method="POST" action="" class="w-full">
            <SelectDropdown name="role" opts={userRoles} selectedOpt={role} />
        </form>
    </div>
    <div class="w-50 2xl:w-100">
        <span class="truncate text-[#535353]">{logMaker} ({logTimestamp}): {logOperation}</span>
    </div>
    <div class="w-50 justify-center">
        <form
            method="POST"
            action="?/deleteAccount"
            class="flex items-center justify-center"
            bind:this={deleteForm}
            use:enhance={({ cancel }) => {
                if (willDelete) {
                    willDelete = false;
                    isDeleting = true;
                    return async ({ update }) => {
                        await update();
                        isDeleting = false;
                    };
                }
                willDelete = true;
                cancel();
            }}
        >
            <Button type="submit" color="red">
                <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                <span>Delete</span>
            </Button>

            <input type="hidden" name="userid" value={userid} />

            {#if willDelete}
                <DeleteConfirmation
                    onDelete={() => {
                        if (deleteForm) deleteForm.requestSubmit();
                    }}
                    onCancel={toggleModal}
                    text="Are you sure you want to delete the account?"
                />
            {/if}
        </form>
    </div>
</div>

{#if isDeleting}
    <LoadingScreen />
{/if}
