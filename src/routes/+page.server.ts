// Doing this in order to test db code

import {db} from "$lib/server/db";
import { accountRoles } from "$lib/server/schema";
import * as accountDAO from "$lib/server/accountDAO";

let results = await accountDAO.listAll();
console.log(results);

console.log ("Page loaded")