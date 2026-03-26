// meant to be run with vite-node with the following command
// npx vite-node tests/seed-data/manual-seed.ts

// known issues
// facultyrank-appointmentposition: put in "Tenured" and "For Renewal" in the appointmentstatus relation

import * as consts from '../test-consts';

consts.seed();
