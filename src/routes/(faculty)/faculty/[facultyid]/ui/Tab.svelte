<script>
    import { page } from "$app/state";
    const { href, name } = $props();

    const unselected = $derived(
        (page.url.pathname === href)
            ? ''
            : 'border-b-2'
    );
</script>

<a {href} class="rounded-t-lg border-t-2 border-l-2 border-r-2 border-fims-green py-1.5 px-6 text-3xl text-fims-green hover:bg-fims-green hover:text-white w-fit text-nowrap {unselected}">{name}</a>