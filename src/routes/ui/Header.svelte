<script lang="ts">
    import LogOutButton from './LogOutButton.svelte';

    interface Props {
        accountColor: string;
        email: string;
    }

    const { accountColor, email }: Props = $props();
</script>

<header class="flex h-14 w-full items-center justify-between bg-white px-6">
    <div>
        <span class="font-semibold text-fims-green">Faculty Information Management System</span>
    </div>
    <div>
        <span class="text-{accountColor} pr-3 font-semibold">{email}</span>
        <LogOutButton />
    </div>
</header>
