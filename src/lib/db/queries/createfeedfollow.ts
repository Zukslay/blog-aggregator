import { users, feeds, feed_follows } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

type RecordFF1 = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    user_name: string;
    feed_name: string;
};

export async function createFeedFollow(feedId: string, userId: string): Promise<RecordFF1> {
    const [feedFollow] = await db.insert(feed_follows).values({
        feedId: feedId,
        userId: userId,
    }).returning();
    

    const [record] = await db.select({
            id: feed_follows.id, 
            createdAt: feed_follows.createdAt, 
            updatedAt: feed_follows.updatedAt,
            user_name: users.name,
            feed_name: feeds.name}).from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .where(eq(feed_follows.id, feedFollow.id))
    return record;
}