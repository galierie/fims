<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';
    import type { Snippet } from 'svelte';

    interface Props {
        color: 'green' | 'red';
        onclick?: MouseEventHandler<HTMLButtonElement>;
        children: Snippet;
        type?: 'button' | 'reset' | 'submit';
        name?: string;
        value?: string;
    }

    const { color, onclick, children, type, name, value }: Props = $props();

    const borderColor = $derived(`border-fims-${color}`);
    const textColor = $derived(`text-fims-${color}`);
    const hoverBgColor = $derived(`hover:bg-fims-${color}`);
</script>

<button
    {type}
    {name}
    {value}
    {onclick}
    class="flex items-center justify-center rounded-full border-2 {borderColor} bg-white px-4 py-1 {textColor} {hoverBgColor} hover:text-white disabled:border-fims-gray disabled:text-fims-gray"
    >{@render children()}</button
>
