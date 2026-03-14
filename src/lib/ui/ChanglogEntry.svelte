<script lang="ts">
	type Props = {
		timestamp:Date,
		email:string,
		info:string
	}

	let {timestamp, email, info}:Props = $props()
</script>

<!-- 
notes:
not entirely sure what's the correct bg color for this component
-->
<div data-testid="changelog-entry" class="flex flex-col w-auto border-b-fims-gray border-b-1 px-3 py-2 bg-gray-100">
	<p class="text-sm">{timestamp.toLocaleDateString()}</p>
	<p class="text-sm">{email}</p>
	<p class="text-lg pt-1">{info}</p>
</div>