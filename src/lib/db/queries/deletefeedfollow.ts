import { users, feeds, feed_follows } from "../schema.js";
import { db } from "../index.js";
import { eq ,and} from "drizzle-orm";

export async function deleteFeedFollow(feedUrl: string, userName: string): Promise<void> {
    const [fId] = await db.select({id: feeds.id}).from(feeds).where(eq(feeds.url, feedUrl));
    const [uId] = await db.select({id: users.id}).from(users).where(eq(users.name, userName));

    if (!fId) {
        throw new Error(`Feed "${feedUrl}" no encontrado`);
    } else if (!uId) {
        throw new Error(`usuario "${userName}" no encontrado`);
    }

    const result = await db.delete(feed_follows).where(and(eq(feed_follows.feedId, fId.id), eq(feed_follows.userId, uId.id))).returning();
    if (result.length > 1){
        console.log("WARNING MULTIPLE RECORDS DELETED: deleteFeedFollow function from blog-aggregator/src/lib/db/queries/deleteFeedFollow.ts")
    }

    console.log(`record ${result[0].id} deleted`)
}