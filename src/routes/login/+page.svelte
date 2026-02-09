<script lang="ts">
  import { enhance } from '$app/forms';
  import Icon from '@iconify/svelte';

  let { form } = $props();

  let isPasswordVisible = $state(false);
  let isSigningIn = $state(false);

  let formElement: HTMLFormElement;
  let passwordInput: HTMLInputElement;
</script>

<svelte:head>
  <script src="https://apis.google.com/js/platform.js" async defer></script>

  <!-- TODO: Add Google OAuth Client ID in content attribute -->
  <meta name="google-signin-client_id" content="">
</svelte:head>

<div class="flex h-screen bg-[url('/assets/login-background.png')] bg-cover bg-center">
  <div class="pr-12 w-212 bg-[rgb(40,118,70)] opacity-80 text-fims-white flex items-center">
    <h1 class="font-bold text-6xl leading-[1.2] tracking-tight text-right">Faculty Information Management System</h1>
  </div>
  <div class="pl-12 w-full flex flex-col justify-center">
    <!-- Error box -->
    {#if form?.error}
      <div class="bg-fims-red-100 border-fims-red border-2 h-8 flex items-center px-4 py-6 w-125 rounded-lg">
        <Icon icon="tabler:alert-hexagon" class="w-6 h-6 text-fims-red" />
        <p class="px-8">{form.error}</p>
      </div>
    {/if}

    <!-- Manual Sign-in -->
    <form
      class="flex flex-col my-8"
      method="POST"
      bind:this={formElement}
      use:enhance={() => {
        isSigningIn = true;
        
        return async ({ update }) => {
          await update();
          isSigningIn = false;
        }
      }}
    >
      <input
        class="my-1 h-12 placeholder-fims-gray bg-white rounded-lg px-4 py-3 w-125"
        name="email" id="email" type="email" placeholder="Email" disabled={isSigningIn} required
        onkeypress={event => {
          if (event.key === 'Enter')
            passwordInput.focus();
        }}
      />
      <div class="relative w-fit">
        <input
          class="my-1 h-12 placeholder-fims-gray bg-white rounded-lg px-4 py-3 w-125"
          name="password" id="password" type={isPasswordVisible ? 'text' : 'password'} placeholder="Password" disabled={isSigningIn} required
          bind:this={passwordInput}
          onkeypress={event => {
            if (event.key === 'Enter')
              formElement.submit();
          }}
        />
        <button
          class="*:w-6 *:h-6 absolute right-4 h-full *:text-fims-gray"
          onclick={event => {
            isPasswordVisible = !isPasswordVisible
            event.preventDefault();
          }}
          disabled={isSigningIn}
        >
          {#if isPasswordVisible}
            <Icon icon="tabler:eye-off" />
          {:else}
            <Icon icon="tabler:eye" />
          {/if}
        </button>
      </div>
    </form>

    <!-- Google SSO -->
    <!-- TODO: Add on success function in data-onsuccess attribute -->
    <div
      class="g-signin2 *:rounded-lg! *:shadow-none!"
      data-onsuccess=""
    ></div>
  </div>
</div>