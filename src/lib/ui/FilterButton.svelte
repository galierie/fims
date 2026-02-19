<script lang="ts">
  import Icon from "@iconify/svelte";

  interface Props {
    field: string;
    opts: string[];
  }

  const { field, opts }: Props = $props();

  let isFilterOpen = $state(false);
  let selectedOpts: string[] = $state([]);

  let borderColor = $derived(selectedOpts.length ? 'border-fims-green' : 'border-fims-gray');
  let textColor = $derived(selectedOpts.length ? 'text-fims-green' : 'text-black');
  let selectedColor = $derived(selectedOpts.length ? 'text-fims-green' : 'text-fims-gray');
</script>

<div class="w-fit">
  <button
    type="button"
    class="flex items-center justify-center px-4 py-1 border {borderColor} rounded-full bg-white"
    onclick={() => (isFilterOpen = !isFilterOpen)}
  >
    <span class="mr-1 {textColor}">{field}:</span>

    <span class="{selectedColor}">{selectedOpts.length ? selectedOpts.join(', ') : 'All'}</span>
    
    <Icon icon={isFilterOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'} class="h-5 w-5 {textColor}" />
  </button>

  <div
      class="rounded-lg p-1 mt-1 {isFilterOpen
          ? 'block'
          : 'hidden'} absolute z-50 w-fit bg-white shadow-lg"
  >
      {#each opts as opt (opt)}
          {#if selectedOpts.includes(opt)}
              <button
                  type="button"
                  class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                  onclick={() => {
                      selectedOpts = selectedOpts.filter((elem) => (elem !== opt));
                  }}
              >
                  <Icon icon="tabler:check" class="h-6 w-8 pr-2 text-fims-green" />
                  <span>{opt}</span>
              </button>
          {:else}
              <button
                  type="button"
                  class="flex w-full rounded-sm p-3 hover:bg-[#e9e9e9]"
                  onclick={() => {
                      selectedOpts.push(opt);
                  }}
              >
                  <div class="w-8 pr-2"></div>
                  <span>{opt}</span>
              </button>
          {/if}
      {/each}
  </div>
</div>