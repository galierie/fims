import {defineConfig} from "vitest/config"
import {neonTesting} from "neon-testing/vite"
import {sveltekit} from "@sveltejs/kit/vite"

export default defineConfig({
    plugins: [neonTesting(), sveltekit()],
});