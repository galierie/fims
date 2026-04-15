<script lang="ts">
    import NavBarItem from './NavBarItem.svelte';

    interface Props {
        accountColor: string;
    }

    const { accountColor }: Props = $props();
</script>

<div class="flex justify-center">
    <nav
        class="border-{accountColor} mt-5 rounded-full border-2 text-{accountColor} absolute flex h-12 w-fit bg-white px-11"
    >
        <NavBarItem pageName="Accounts" href="/accounts" />
        <NavBarItem pageName="Faculty Records" href="/" />
    </nav>
</div>
