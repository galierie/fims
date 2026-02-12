// place files you want to import through the `$lib` alias in this folder.
import {db} from "$lib/server/db"
import { accountRoles, accounts} from "$lib/server/schema";

console.log("test");

db.insert(accountRoles).values({
    accountRole: "testRole",
    canAddAccount: 0,
    canAddFaculty: 0,
    canModifyAccount: 0,
    canModifyFaculty: 0,
    canViewChangeLogs: 0,
});