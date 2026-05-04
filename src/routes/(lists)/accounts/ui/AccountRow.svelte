<script lang="ts">
    import { enhance } from '$app/forms';
    import type { AccountDTO } from '$lib/server/queries/account-list';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import SaveConfirmation from '$lib/ui/SaveConfirmation.svelte';
    import SelectDropdownCell from '$lib/ui/SelectDropdownCell.svelte';
    import AccountActionsCell from './AccountActionsCell.svelte';

    interface Props {
        account: AccountDTO;
        isSelected: boolean;
        onToggle: () => void;
    }

    const { account, isSelected, onToggle }: Props = $props();
    const { email, role, id, logTimestamp, logOperation, logMaker }: AccountDTO = $derived(account);

    const userRoles = ['Admin', 'IT'];
    let isLoading = $state(false);

    let selectedOpt = $state(null);
    let willChangeRole = $state(false);
    function toggleSaveModal() {
        willChangeRole = !willChangeRole;
        selectedOpt = null;
    }
    $effect(() => {
        if (
            selectedOpt !== null &&
            userRoles.includes(selectedOpt) &&
            selectedOpt !== role &&
            !willChangeRole
        ) 
            if (changeRoleForm !== null) 
                changeRoleForm.requestSubmit();
            
        
    });

    let changeRoleForm: HTMLFormElement | null = $state(null);
</script>

{#if email}
    <div
        data-testid="account-row"
        class="flex justify-center [&>div]:flex [&>div]:h-12 [&>div]:items-center [&>div]:border-b [&>div]:border-fims-gray [&>div]:bg-white [&>div]:px-6"
    >
        <div class="w-25 justify-center">
            <input
                type="checkbox"
                checked={isSelected}
                onchange={onToggle}
                class="h-5 w-5 rounded-sm checked:bg-fims-gray focus:ring-0"
            />
        </div>
        <div class="w-66 2xl:w-132"><span>{email}</span></div>
        <div class="w-40 px-0!">
            <form
                method="POST"
                action="?/changeRole"
                class="w-full"
                bind:this={changeRoleForm}
                use:enhance={({ cancel }) => {
                    if (willChangeRole) {
                        isLoading = true;
                        return async ({ update }) => {
                            await update();
                            selectedOpt = null;
                            willChangeRole = false;
                            isLoading = false;
                        };
                    }
                    willChangeRole = true;
                    cancel();
                }}
            >
                <SelectDropdownCell
                    name="role"
                    opts={userRoles}
                    defaultSelectedOpt={role}
                    isEditable={true}
                    bind:selectedOpt
                />

                <input type="hidden" name="userId" value={id} />

                {#if willChangeRole}
                    <SaveConfirmation
                        onSave={() => {
                            if (changeRoleForm) changeRoleForm.requestSubmit();
                        }}
                        onCancel={toggleSaveModal}
                        text="Are you sure you want to change the account role?"
                    />
                {/if}
            </form>
        </div>
        <div class="w-85 2xl:w-100">
            <span class="truncate text-[#535353]">{logMaker} ({logTimestamp}): {logOperation}</span>
        </div>
        <div class="w-100 justify-center px-0!">
            <AccountActionsCell {id} bind:isLoading />
        </div>
    </div>

    {#if isLoading}
        <LoadingScreen />
    {/if}
{/if}
