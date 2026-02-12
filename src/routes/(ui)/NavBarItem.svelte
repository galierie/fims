<script lang="ts">
    import { page } from '$app/state';

    interface Props {
        pageName: string;
        href: string;
    }

    const { pageName, href }: Props = $props();
</script>

<div
    class="flex h-full justify-center px-4 pt-1 {page.url.pathname === href
        ? 'bg-fims-white'
        : 'bg-white'} hover:bg-fims-white"
>
    <div
        class="flex h-full w-fit items-center border-b-3 {page.url.pathname === href
            ? 'border-b-fims-red'
            : 'border-b-transparent'}"
    >
        <a {href} class="font-semibold">{pageName}</a>
    </div>
</div>
