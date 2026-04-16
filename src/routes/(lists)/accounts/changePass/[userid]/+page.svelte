<script lang="ts">
    import { goto } from '$app/navigation';
    import GreenButton from '$lib/ui/GreenButton.svelte';
    import RedButton from '$lib/ui/RedButton.svelte';

    const { data } = $props();
    const { userid } = $derived(data);
</script>

<br />
<div class="flex justify-center">
    <div class="mt-25 flex w-200 flex-col items-stretch p-20 text-center">
        <h1 class="text-2xl">Change password</h1>
        <form method="POST" action="?/changePassword" class="mt-5 flex flex-col items-center gap-5">
            <label for="newpass"
                >New Password: <input name="newpass" type="password" required /></label
            >
            <div class="flex justify-around gap-20">
                <RedButton
                    type="button"
                    onclick={async () => {
                        await goto('/accounts');
                    }}>Cancel</RedButton
                >
                <GreenButton type="submit" name="userid" value={userid}>Confirm</GreenButton>
            </div>
        </form>
    </div>
</div>
