import { feeds, users } from "../schema.js";
import { db } from "../index.js";
import { readConfig } from "../../../config.js";
import { eq } from "drizzle-orm";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export async function addFeedQuery(name: string, url: string): Promise<void> {
    const currentUser = readConfig().currentUserName;
    if (!currentUser) {
        throw new Error("No current user set. Please login first.");
    }
    if (!name || !url) {
        throw new Error("Both feed name and URL must be provided.");
    }

    const [user] = await db.select().from(users).where(eq(users.name, currentUser));
    if (!user) {
        throw new Error(`Current user ${currentUser} does not exist in the database.`);
    }
    const [result] = await db.insert(feeds).values({
        name: name,
        url: url,
        userId: user.id,
    }).returning();

    printFeed(result, user);
}

function printFeed(feed: Feed, user: User): void {
    console.log(`Feed Name: ${feed.name}`);
    console.log(`Feed URL: ${feed.url}`);
    console.log(`Associated User: ${user.name}`);
    console.log('---------------------------');
}