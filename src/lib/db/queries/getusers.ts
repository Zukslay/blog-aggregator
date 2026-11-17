import { users } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

type UserRecord = {
    name: string;
};

export async function getUsers(): Promise<UserRecord[]> {
    const result = await db.select({name : users.name}).from(users);
    return result;
}

export async function getUserIdByName(name: string): Promise<string | null> {
    const result = await db.select({id : users.id}).from(users).where(eq(users.name, name));
    if (result.length === 0) {
        return null;
    }
    return result[0].id;
}