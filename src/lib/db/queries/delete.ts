import { feeds, users } from "../schema.js";
import { db } from "../index.js";

export async function truncateUsers(): Promise<void> {
    await db.delete(users);
}

export async function truncateFeeds(): Promise<void> {
    await db.delete(feeds);
}