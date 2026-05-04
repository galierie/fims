<script lang="ts">
    import Icon from '@iconify/svelte';

    import { goto, invalidateAll } from '$app/navigation';

    let isDropdownOpen = $state(false);

    interface Props {
        accountColor: string;
        email: string;
    }

    // accountColors
    // fims-green
    // fims-red

    const { accountColor, email }: Props = $props();
    const isLoading = $state(false);
</script>

<div class="relative h-full w-60">
    <button
        type="button"
        data-testid={`account-action-${email}`}
        class="flex h-full w-full items-center text-{accountColor} justify-end font-semibold"
        onclick={() => {
            isDropdownOpen = !isDropdownOpen;
        }}
    >
        <span>{email}</span>
        <Icon
            icon={isDropdownOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            class="ml-3 h-full w-5"
        />
    </button>

    <div
        class="rounded-lg p-1 {isDropdownOpen
            ? 'block'
            : 'hidden'} absolute z-50 max-h-60 w-full overflow-y-auto bg-white shadow-lg"
    >
        <!-- Log-out -->
        <button
            type="submit"
            class="flex w-full rounded-sm p-3 text-fims-red hover:bg-fims-red hover:text-white"
            onclick={async () => {
                await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                invalidateAll();
            }}
        >
            <Icon icon="tabler:logout" class="mr-2 h-6 w-6" />
            <span>Log-out</span>
        </button>

        <!-- Change Password -->
        <button
            type="submit"
            class="flex w-full rounded-sm p-3 text-fims-red hover:bg-fims-red hover:text-white"
            onclick={async () => {
                await goto('/accounts/change-password');
            }}
        >
            <Icon icon="tabler:edit" class="mr-2 h-6 w-6" />
            <span>Change Password</span>
        </button>
    </div>
</div>
