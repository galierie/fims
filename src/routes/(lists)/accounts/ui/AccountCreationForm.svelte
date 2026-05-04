<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';
    import SaveConfirmation from '$lib/ui/SaveConfirmation.svelte';
    import SelectDropdownCell from '$lib/ui/SelectDropdownCell.svelte';

    interface Props {
        userRoles: string[];
        isLoading: boolean;
        isMakingAccount: boolean;
    }

    let { userRoles, isLoading = $bindable(), isMakingAccount = $bindable() }: Props = $props();

    let willMake = $state(false);

    function toggleModal() {
        isMakingAccount = !isMakingAccount;
        willMake = !willMake;
    }
    
    let newEmail = $state('');
    let newPassword = $state('');
    let makeForm: HTMLFormElement | null = $state(null);
</script>

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
            placeholder="Enter email here; must be UP email"
            class="h-full w-full border-0 p-2 focus:ring-0"
            bind:value={newEmail}
            required
        />
    </div>
    <div class="w-40 px-0!">
        <SelectDropdownCell
            name="role"
            opts={userRoles}
            defaultSelectedOpt={userRoles[0]}
            isEditable={true}
        />
    </div>
    <div class="w-85 2xl:w-100">
        <input
            type="password"
            name="password"
            placeholder="Set initial password; min. 8 characters"
            class="h-full w-full border-0 p-2 focus:ring-0"
            bind:value={newPassword}
            required
        />
    </div>
    <div class="w-100 justify-center py-1 px-1!">
        <button
            type="submit"
            class="flex w-full h-full rounded-sm px-2 hover:bg-fims-green text-fims-green hover:text-white items-center disabled:border-fims-gray disabled:bg-fims-white disabled:text-fims-gray"
            disabled={!newEmail.endsWith('@up.edu.ph') || newPassword.length < 8}
        >
            <Icon icon="tabler:device-floppy" class="mr-2 h-6 w-6" />
            <span>Save</span>
        </button>
    </div>
</form>

{#if willMake}
    <SaveConfirmation
        onSave={() => {
            if (makeForm) makeForm.requestSubmit();
        }}
        onCancel={toggleModal}
        text="Are you sure you want to save the account?"
    />
{/if}