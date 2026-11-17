import { users, feeds, feed_follows } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

type FeedRecord = {
    name: string;
    url: string;
    userName: string;
};

export async function getFeeds(): Promise<FeedRecord[]> {
    const result = await db.select({
        name: feeds.name, 
        url: feeds.url, 
        userName: users.name})
        .from(feeds)
        .innerJoin(users, eq(feeds.userId ,users.id));
    return result;
}

export async function getFeedIdByUrl(url: string): Promise<string | null> {
    const result = await db.select({id: feeds.id})
        .from(feeds)
        .where(eq(feeds.url, url));
    if (result.length === 0) {
        return null;
    }
    return result[0].id;
}

export async function getFeedFollowsForUser(userId: string): Promise<FeedRecord[]> {
    const result = await db.select({
        name: feeds.name, 
        url: feeds.url, 
        userName: users.name})
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
        .innerJoin(users, eq(feed_follows.userId ,users.id))
        .where(eq(feed_follows.userId, userId));
    return result;
}