<script lang="ts">
    import { enhance } from '$app/forms';
    import Icon from '@iconify/svelte';

    const { form } = $props();

    let isPasswordVisible = $state(false);
    let isSigningIn = $state(false);

    let formElement: HTMLFormElement | null = null;
    let passwordInput: HTMLInputElement | null = null;
</script>

<svelte:head>
    <script src="https://apis.google.com/js/platform.js" async defer></script>

    <!-- TODO: Add Google OAuth Client ID in content attribute -->
    <meta name="google-signin-client_id" content="dummy" />
</svelte:head>

<div class="flex h-screen bg-[url('/assets/login-background.png')] bg-cover bg-center">
    <div class="flex w-212 items-center bg-[rgb(40,118,70)] pr-12 text-fims-white opacity-80">
        <h1 class="text-right text-6xl leading-[1.2] font-bold tracking-tight">
            Faculty Information Management System
        </h1>
    </div>
    <div class="flex w-full flex-col justify-center pl-12">
        <!-- Error box -->
        {#if form?.error}
            <div
                class="flex h-8 w-125 items-center rounded-lg border-2 border-fims-red bg-fims-red-100 px-4 py-6"
            >
                <Icon icon="tabler:alert-hexagon" class="h-6 w-6 text-fims-red" />
                <p class="px-8">{form.error}</p>
            </div>
        {/if}

        <!-- Manual Sign-in -->
        <form
            class="my-8 flex flex-col"
            method="POST"
            bind:this={formElement}
            use:enhance={() => {
                isSigningIn = true;

                return async ({ update }) => {
                    await update();
                    isSigningIn = false;
                };
            }}
        >
            <input
                class="my-1 h-12 w-125 rounded-lg bg-white px-4 py-3 placeholder-fims-gray"
                name="email"
                id="email"
                type="email"
                placeholder="Email"
                disabled={isSigningIn}
                required
                onkeypress={(event) => {
                    if (event.key === 'Enter' && passwordInput) passwordInput.focus();
                }}
            />
            <div class="relative w-fit">
                <input
                    class="my-1 h-12 w-125 rounded-lg bg-white px-4 py-3 placeholder-fims-gray"
                    name="password"
                    id="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="Password"
                    disabled={isSigningIn}
                    required
                    bind:this={passwordInput}
                    onkeypress={(event) => {
                        if (event.key === 'Enter' && formElement) formElement.submit();
                    }}
                />
                <button
                    class="absolute right-4 h-full *:h-6 *:w-6 *:text-fims-gray"
                    onclick={(event) => {
                        isPasswordVisible = !isPasswordVisible;
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
        <div class="g-signin2 *:rounded-lg! *:shadow-none!" data-onsuccess=""></div>
    </div>
</div>
