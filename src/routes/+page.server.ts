// Doing this in order to test db code

import {db} from "$lib/server/db";
import { accountRoles } from "$lib/server/schema";

db.insert(accountRoles).values({
    accountRole: "testRole",
    "canAddAccount": 0,
    "canViewChangeLogs": 0,
    "canAddFaculty": 0,
    "canModifyAccount": 0,
    "canModifyFaculty": 0,
});

const result = await db
    .select()
    .from(accountRoles)
console.log(result)

console.log ("Page loaded")