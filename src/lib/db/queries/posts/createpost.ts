import { db } from "../../index.js";
import { posts, feed_follows } from "../../schema.js";
import { eq, sql } from "drizzle-orm";
import { readConfig } from "../../../../config.js";
import { getUserIdByName } from "../users/getusers.js";

export async function createPost(title: string, url: string, feedId: string, description: string = "", publishedAt: Date | null = null): Promise<void> {
    const currentUser = readConfig().currentUserName;
    if (!currentUser) {
        throw new Error("No current user set. Please login first.");
    }
    if (!feedId || !url) {
        throw new Error("Both feedId and URL must be provided.");
    }

    const re = await db.insert(posts).values({
        title: title,
        url: url,
        feedId: feedId,
        description: description,
        publishedAt: publishedAt
    })
}

export async function getPostsForUser(id: string, limit: number): Promise<{title: string, url: string, description: string | null}[]> {
    
    const postsForUser = await db.select({title: posts.title, url: posts.url, description: posts.description}).from(feed_follows)
            .innerJoin(posts, eq(posts.feedId, feed_follows.feedId))
            .where(eq(feed_follows.userId, id))
            .orderBy(sql`published_at DESC NULLS LAST`)
            .limit(limit);
    return postsForUser;
}