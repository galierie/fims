import { db } from "./db";
import { userrole } from "./db/schema";

export async function assignRole(id: string, role: string) {
  await db.insert(userrole).values({
    userid: id,
    role: role,
  });

  return { success: true };
}