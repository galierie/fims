<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';
    import Icon from '@iconify/svelte';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';

    interface Props {
        userId: string;
    }

    const { data, form } = $props();
    const { userId }: Props = $derived(data);

    let currentPassword = $state('');
    let newPassword = $state('');
    let newPasswordReentry = $state('');

    let isLoading = $state(false);
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

<div class="flex justify-center">
    <div class="mt-25 p-20 text-center">
        <h1 class="text-2xl">Change Password</h1>
        <form method="POST" action="?/changePassword" class="mt-5 w-full flex flex-col gap-5" use:enhance={() => {
            isLoading = true;
            return async ({ update }) => {
                await update();
                isLoading = false;
            };
        }}>
            <div class="flex justify-center items-center">
                <label for="currentPassword" class="text-right w-45"
                    >Current Password: </label
                >
                <input name="currentPassword" type="password" class="ml-1 h-8 w-50 rounded-sm border-0 bg-white p-1 placeholder-fims-gray focus:ring-0 2xl:w-75" placeholder="-" required bind:value={currentPassword} />
            </div>
            <div class="flex justify-center items-center">
                <label for="newPassword" class="text-right w-45"
                    >New Password: </label
                >
                <input name="newPassword" type="password" class="ml-1 h-8 w-50 rounded-sm border-0 bg-white p-1 placeholder-fims-gray focus:ring-0 2xl:w-75" placeholder="Min. 8 characters" required bind:value={newPassword} />
            </div>
            <div class="flex justify-center items-center">
                <label for="newPasswordReentry" class="text-right w-45"
                    >Retype New Password: </label
                >
                <input name="newPasswordReentry" type="password" class="ml-1 h-8 w-50 rounded-sm border-0 bg-white p-1 placeholder-fims-gray focus:ring-0 2xl:w-75" placeholder="Min. 8 characters" required bind:value={newPasswordReentry} />
            </div>
            <div class="flex justify-around gap-5">
                <RedButton
                    type="button"
                    onclick={async () => {
                        await goto('/');
                    }}>
                    <Icon icon="tabler:edit-off" class="mr-2 h-6 w-6" />
                        Cancel
                    </RedButton
                >
                {#if currentPassword.length >= 8 && newPassword.length >= 8 && newPassword === newPasswordReentry}
                    <GreenButton type="submit" name="userId" value={userId}>
                        <Icon icon="tabler:check" class="mr-2 h-6 w-6" />
                        Confirm Password Change
                    </GreenButton>
                {/if}
            </div>
        </form>
    </div>
</div>

{#if isLoading}
    <LoadingScreen />
{/if}
