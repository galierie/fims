<script lang="ts">
    import { enhance } from '$app/forms';
    import LoadingScreen from '$lib/ui/LoadingScreen.svelte';
    import Icon from '@iconify/svelte';

    const { form } = $props();

    let isPasswordVisible = $state(false);
    let isSigningIn = $state(false);

    let formElement: HTMLFormElement | null = null;
    let passwordInput: HTMLInputElement | null = null;
</script>

<div class="flex h-screen bg-[url('/assets/login-background.png')] bg-cover bg-center">
    <div class="flex w-282 items-center bg-[rgb(40,118,70)] pr-12 text-fims-white opacity-80">
        <h1 class="text-right text-7xl leading-[1.2] font-bold tracking-tight">
            Faculty Information Management System
        </h1>
    </div>
    <div class="flex w-full flex-col justify-center pl-16">
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
            action="?/signInEmail"
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
                class="mt-3 h-12 w-156 rounded-lg border-0 bg-white px-4 py-3 placeholder-fims-gray focus:ring-0"
                name="email"
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
                    class="mt-3 h-12 w-156 rounded-lg border-0 bg-white px-4 py-3 placeholder-fims-gray focus:ring-0"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="Password"
                    disabled={isSigningIn}
                    required
                    bind:this={passwordInput}
                    onkeypress={(event) => {
                        if (event.key === 'Enter' && formElement) formElement.requestSubmit();
                    }}
                />
                <button
                    type="button"
                    class="absolute top-1.5 right-4 h-full *:h-6 *:w-6 *:text-fims-gray"
                    onclick={() => {
                        isPasswordVisible = !isPasswordVisible;
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
        <form method="POST" action="?/signInSocial">
            <button
                class="h-12 w-47 rounded-lg border-0 bg-[#e9e9e9]"
                name="provider"
                value="google"
                type="submit">Sign in with Google</button
            >
        </form>
    </div>
</div>

{#if isSigningIn}
    <LoadingScreen />
{/if}
