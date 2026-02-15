<script>
    const { onSave, onCancel } = $props();
</script>

<div class="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.9)]">
    <div class="w-[90%] max-w-150 rounded-2xl bg-fims-beige px-10 py-15 text-center">
        <p class="mb-7.5 text-black">Are you sure you want to save the account?</p>

        <div class="flex justify-around gap-5">
            <button
                class="cursor-pointer rounded-3xl border-2 border-solid border-fims-green px-7.5 py-2.5 text-base text-fims-green transition-opacity duration-200 hover:opacity-70"
                onclick={onSave}>Save</button
            >
            <button
                class="cursor-pointer rounded-3xl border-2 border-solid border-fims-red px-7.5 py-2.5 text-base text-fims-red transition-opacity duration-200 hover:opacity-70"
                onclick={onCancel}>Cancel</button
            >
        </div>
    </div>
</div>
