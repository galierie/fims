import {db} from "$lib/server/db"
import { account, appuser, userinfo } from "$lib/server/db/schema"
import {eq} from "drizzle-orm"
import { createAuthClient } from "better-auth/client"
import { auth } from "./auth"

export type Account = typeof account.$inferSelect
const authClient = createAuthClient()

/*
creates an account with the following fields:
email, passwordHash, accountRole

note: account role factored out as there's no use as of now
*/

export async function createAcc(
    email:string,
    name:string,
    passHash:string,
    roleName:string
):Promise<boolean> {
    try {
        let newAcc = await auth.api.signUpEmail({
            body: {
                name: name,
                email: email,
                password: passHash,
            }
        })


        // past this point, account is made. assign role
        await db.insert(userinfo)
        .values({
            role: roleName,
            userid: newAcc.user.id
        })
    } catch(e) {
        console.log(e); // not sure how to display errors. will just change it later to return error instead.
        return false;
    }
    return true;
}

//uses id to delete the account
export async function deleteAcc(id:string):Promise<boolean> {
    try {
        await db.delete(appuser).where(eq(appuser.id, id));
    } catch(e) {
        console.log(e);
        return false;
    }
    return false;
}

export async function listAll():Promise<Array<Account>> {
    let res = await db.select().from(account);
    return res;
}