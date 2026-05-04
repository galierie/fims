<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import { goto } from '$app/navigation';

    import DeleteConfirmation from '$lib/ui/DeleteConfirmation.svelte';

    let isDropdownOpen = $state(false);

    interface Props {
        id: string;
        isLoading: boolean;
    }

    let { id, isLoading = $bindable() }: Props = $props();
    
    let deleteForm: HTMLFormElement | null = $state(null);

    let willDelete = $state(false);
    function toggleDeleteModal() {
        willDelete = !willDelete;
    }
</script>

<div class="relative h-full w-full">
    <button
        type="button"
        data-testid={`account-action-${id}`}
        class="relative h-full w-full"
        onclick={() => {
            isDropdownOpen = !isDropdownOpen;
        }}
    >
        <span>Select Account Action</span>
        <Icon
            icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            class="absolute top-0 right-5 h-full w-4"
        />
    </button>

    <div
        class="rounded-lg p-1 {isDropdownOpen
            ? 'block'
            : 'hidden'} absolute z-50 max-h-60 w-full overflow-y-auto bg-white shadow-lg"
    >
        <!-- Delete Account -->
        <form
            method="POST"
            action="?/deleteAccount"
            class="flex items-center justify-center"
            bind:this={deleteForm}
            use:enhance={({ cancel }) => {
                if (willDelete) {
                    isLoading = true;
                    return async ({ update }) => {
                        await update();
                        willDelete = false;
                        isLoading = false;
                    };
                }
                willDelete = true;
                cancel();
            }}
        >
            <button
                type="submit"
                class="flex w-full rounded-sm p-3 hover:bg-fims-red text-fims-red hover:text-white"
            >
                <Icon icon="tabler:trash" class="mr-2 h-6 w-6" />
                <span>Delete</span>
            </button>

            <input type="hidden" name="userId" value={id} />

            {#if willDelete}
                <DeleteConfirmation
                    onDelete={() => {
                        if (deleteForm) deleteForm.requestSubmit();
                    }}
                    onCancel={toggleDeleteModal}
                    text="Are you sure you want to delete the account?"
                />
            {/if}
        </form>

        <!-- Reset Password -->
        <form method="POST" action="?/resetPassword" class="flex items-center justify-center">
            <button
                type="submit"
                class="flex w-full rounded-sm p-3 hover:bg-fims-red text-fims-red hover:text-white"
                name="userid"
                value={id}
            >
                <Icon icon="tabler:refresh" class="mr-2 h-6 w-6" />
                <span>Reset Password</span>
            </button>
        </form>

        <!-- Change Password -->
        <button
            type="button"
            class="flex w-full rounded-sm p-3 hover:bg-fims-red text-fims-red hover:text-white"
            onclick={async () => {
                await goto(`/accounts/changePass/${id}`);
            }}
        >
            <Icon icon="tabler:edit" class="mr-2 h-6 w-6" />
            <span>Edit Password</span>
        </button>
    </div>
</div>
