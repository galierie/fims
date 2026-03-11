<script>
    import ProfileForm from '../[facultyid]/ui/ProfileForm.svelte';

    const { data } = $props();
    const { opts, dependencyMaps } = $derived(data);
</script>

<main class="bg-[#e9e9e9]">
    <div class="mx-6 pt-7.5 pb-40">
        <ProfileForm {opts} {dependencyMaps} isCreating={true} />
    </div>
</main>
