<script>
	export let onDelete = () => {};
	export let onCancel = () => {};
</script>

<div class="fixed w-full h-full bg-[rgba(0,0,0,0.9)] flex justify-center items-center left-0 top-0">
  <div class="bg-fims-beige text-center w-[90%] max-w-150 px-10 py-15 rounded-2xl">
    <p class="text-black mb-7.5">Are you sure you want to delete the account?</p>
    
    <div class="flex justify-around gap-5">
      <button class="text-base cursor-pointer transition-opacity duration-200 px-7.5 py-2.5 rounded-3xl hover:opacity-70 border-fims-green text-fims-green border-2 border-solid" on:click={onDelete} type="submit">Delete</button>
			<button class="text-base cursor-pointer transition-opacity duration-200 px-7.5 py-2.5 rounded-3xl hover:opacity-70 border-fims-red text-fims-red border-2 border-solid" on:click={onCancel}>Cancel</button>
    </div>
  </div>
</div>