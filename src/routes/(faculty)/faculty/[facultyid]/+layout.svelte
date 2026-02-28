<script lang="ts">
    import Icon from '@iconify/svelte';

    const { data, children } = $props();
    const { lastName, firstName } = $derived(data);
</script>

<main class="bg-[#e9e9e9]">
    <div class="mx-6 pt-7.5 pb-40">
        <div>
            <a href="/" class="flex h-7 items-center text-fims-green">
                <Icon icon="line-md:arrow-left-circle" class="mr-2 h-6 w-6" />
                <span class="underline">Back to List of Faculty Records</span>
            </a>
            <h1 class="mt-8 text-3xl font-semibold text-fims-green" id="name-display">
                {lastName}, {firstName}
            </h1>
        </div>
        {@render children()}
    </div>
</main>
