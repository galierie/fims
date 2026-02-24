<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';
    import type { Snippet } from 'svelte';

    interface Props {
        onclick?: MouseEventHandler<HTMLButtonElement>;
        children: Snippet;
        type?: 'button' | 'reset' | 'submit';
        name?: string;
        value?: string;
        disabled?: boolean;
    }

    const { onclick, children, type, name, value, disabled }: Props = $props();
</script>

<button
    {type}
    {name}
    {value}
    {onclick}
    class="flex items-center justify-center rounded-full border-2 border-fims-green bg-white px-4 py-1 text-fims-green hover:bg-fims-green hover:text-white disabled:border-fims-gray disabled:bg-fims-white disabled:text-fims-gray"
    {disabled}>{@render children()}</button
>
