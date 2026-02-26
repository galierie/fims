<script lang="ts">
    import NavBarItem from './NavBarItem.svelte';

    interface Props {
        canViewAccounts: boolean;
        accountColor: string;
    }

    const { canViewAccounts, accountColor }: Props = $props();
</script>

{#if canViewAccounts}
    <div class="flex justify-center">
        <nav
            class="border-{accountColor} mt-5 rounded-full border-2 text-{accountColor} absolute flex h-12 w-fit bg-white px-11"
        >
            <NavBarItem pageName="Accounts" href="/accounts" />
            <NavBarItem pageName="Faculty Records" href="/" />
        </nav>
    </div>
{/if}
