import { eq } from 'drizzle-orm';

import { db } from './db';

import { role, userrole } from './db/schema';

export async function assignRole(id: string, role: string) {
    await db.insert(userrole).values({
        userid: id,
        role,
    });

    return { success: true };
}

export async function getRole(id: string) {
    const [fetchedUser] = await db.select().from(userrole).where(eq(userrole.userid, id)).limit(1);

    return fetchedUser.role;
}

export async function getPermissions(userRole: string) {
    const [fetchedRole] = await db.select().from(role).where(eq(role.role, userRole)).limit(1);

    return fetchedRole;
}
