<script>
    import { invalidateAll } from '$app/navigation';
</script>

<button
    type="submit"
    class="rounded-full border-2 border-fims-red bg-white px-9 py-2 text-fims-red hover:bg-fims-red hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
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
    Log-out
</button>
