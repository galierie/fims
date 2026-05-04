<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    interface Props {
        userId: string;
    }

    const { data } = $props();
    const { userId }: Props = $derived(data);

    let newPassword = $state('');
    let newPasswordReentry = $state('');
</script>

<br />
<div class="flex justify-center">
    <div class="mt-25 flex w-200 flex-col items-stretch p-20 text-center">
        <h1 class="text-2xl">Change Password</h1>
        <form method="POST" action="?/changePassword" class="mt-5 flex flex-col items-center gap-5" use:enhance>
            <label for="oldPassword"
                >Old Password: <input name="oldPassword" type="password" required /></label
            >
            <label for="newPassword"
                >New Password: <input name="newPassword" type="password" required bind:value={newPassword} /></label
            >
            <label for="newPasswordReentry"
                >Confirm New Password: <input name="newPasswordReentry" type="password" required bind:value={newPasswordReentry} /></label
            >
            <div class="flex justify-around gap-20">
                <RedButton
                    type="button"
                    onclick={async () => {
                        await goto('/');
                    }}>Cancel</RedButton
                >
                {#if newPassword !== '' && newPassword === newPasswordReentry}
                    <GreenButton type="submit" name="userId" value={userId}>Confirm Password Change</GreenButton>
                {/if}
            </div>
        </form>
    </div>
</div>
