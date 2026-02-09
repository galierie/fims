<script lang="ts">
  import { page } from "$app/state";

  interface Props {
    pageName: string;
    href: string;
  }

  let { pageName, href } = $props();
</script>

<div class="flex justify-center px-4 pt-1 h-full {(page.url.pathname === href) ? 'bg-fims-white' : 'bg-white'} hover:bg-fims-white">
  <div class="w-fit h-full flex items-center border-b-3 {(page.url.pathname === href) ? 'border-b-fims-red' : 'border-b-transparent'}">
    <a {href} class="font-semibold">{pageName}</a>
  </div>
</div>