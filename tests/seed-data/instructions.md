# Current manual seeding instructions

I am not exactly sure how to do this cleanly but for now this works:

1. Put the code from `seed_accounts` under `+layout.server.ts`. Make sure it's the first one run.
2. Delete the code
3. Run `npx vite-node tests/seed-data/manual-seed.ts`