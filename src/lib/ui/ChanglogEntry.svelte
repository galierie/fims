<script lang="ts">
    type Props = {
        timestamp: Date;
        email: string;
        info: string;
    };

    const { timestamp, email, info }: Props = $props();
</script>

<!-- 
notes:
not entirely sure what's the correct bg color for this component
-->
<div
    data-testid="changelog-entry"
    class="flex w-auto flex-col border-b-1 border-b-fims-gray bg-gray-100 px-3 py-2"
>
    <p class="text-sm">{timestamp.toLocaleDateString()}</p>
    <p class="text-sm">{email}</p>
    <p class="pt-1 text-lg">{info}</p>
</div>
