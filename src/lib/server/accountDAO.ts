import {db} from "$lib/server/db"
import {accounts, accountRoles} from "$lib/server/schema"
import {eq} from "drizzle-orm"

export type Account = typeof accounts.$inferSelect
export type AccountRole = typeof accountRoles.$inferSelect

/*
creates an account with the following fields:
email, passwordHash, accountRole

note: account role factored out as there's no use as of now
*/

export async function createAcc(
    email:string,
    passHash:string,
    role:string
):Promise<boolean> {
    try {
        await db.insert(accounts)
        .values({
            email: email,
            passwordHash: passHash,
            // accountRole: role
        })
    } catch(e) {
        console.log(e); // not sure how to display errors. will just change it later to return error instead.
        return false;
    }
    return true;
}

//uses id to delete the account
export async function deleteAcc(id:number):Promise<boolean> {
    if (!Number.isInteger(id)) {return false;}
    try {
        await db
        .delete(accounts)
        .where(eq(accounts.accountId, id))
    } catch(e) {
        console.log(e);
        return false;
    }
    return false;
}

export async function listAll():Promise<Array<Account>> {
    let res = await db.select().from(accounts);
    return res;
}