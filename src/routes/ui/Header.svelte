<script lang="ts">
    import OwnAccountActionsDropdown from "./OwnAccountActionsDropdown.svelte";

    interface Props {
        email: string;
    }

    const { accountColor, email }: Props = $props();
</script>

<header class="flex h-14 w-full items-center justify-between bg-white px-6">
    <div>
        <span class="font-semibold text-fims-green">Faculty Information Management System</span>
    </div>
    <div class="w-fit">
        <OwnAccountActionsDropdown {email} {accountColor} />
    </div>
</header>
