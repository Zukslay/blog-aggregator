import { feeds } from "../schema.js";
import { db } from "../index.js";
import { eq, sql } from "drizzle-orm";
import { fetchRSSFeed, RSSFeed, RSSItem } from "../../../fetchRSS.js";
import { createPost } from "./posts/createpost.js";

export type RecordFF2 = typeof feeds.$inferSelect;
export const records: RecordFF2[] = [];

export async function markFeedFetched(feed_id: string): Promise<void> {
    await db.update(feeds).set({ updatedAt: new Date(), lastFetchedAt: new Date()}).where(eq(feeds.id, feed_id)).returning();
    console.log(`timestamps updated for feed with id ${feed_id} `)
}

export async function getNextFeedToFetch(records: RecordFF2[]): Promise<RecordFF2> {
    if (records.length == 0){
        const recs = await db
            .select()
            .from(feeds)
            .orderBy(sql`last_fetched_at DESC NULLS LAST`);
        records.push(...recs)
    }
    const toFetch: RecordFF2 | undefined = records.pop()
    if (!toFetch){
        throw new Error("no feed to fetch")
    }
    return toFetch;


}

export async function scrapeFeeds(records: RecordFF2[]): Promise<void> {
    const feed: RecordFF2 = await getNextFeedToFetch(records);
    const data: RSSFeed = await fetchRSSFeed(feed.url)
    markFeedFetched(feed.id)
    for (const item of data.channel.item){
        createPost(item.title, item.link, feed.id ,item.description, parseDate(item.pubDate));
    }
}
function parseDate(dateStr: string): Date | null {
  const date: Date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}