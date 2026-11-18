import { CommandHandler } from "./commands.js";
import { readConfig } from "../config.js";
import { getUserIdByName } from "../lib/db/queries/users/getusers.js";
import { addFeedQuery } from "../lib/db/queries/feeds/addfeed.js";
import { getFeedIdByUrl, getFeedFollowsForUser } from "../lib/db/queries/feeds/getfeeds.js";
import { createFeedFollow } from "../lib/db/queries/feeds_follows/createfeedfollow.js";
import { deleteFeedFollow } from "../lib/db/queries/feeds_follows/deletefeedfollow.js";
import { getPostsForUser } from "../lib/db/queries/posts/createpost.js";


type UserCommandHandler = (
  user: string,
  ...args: string[]
) => Promise<void>;

type middlewareLog = (handler: UserCommandHandler) => CommandHandler;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async function(...args: string[]) {
        const name = readConfig().currentUserName;
        const userId = await getUserIdByName(name)
        if (!userId) {
            throw new Error(`user with name ${name} does not exist. Please register the user first.`);
        }
        await handler(userId, ...args)
    }
    
    
    

}

export async function addFeedHandler(userId:string, ...args: string[]): Promise<void> {
    if (args.length < 2) {
        throw new Error("Both feed name and URL must be provided for addfeed command");
    }

    const [name, url] = args;
    await addFeedQuery(name, url);
    await followHandler(userId, url); // Automatically follow the feed for the user
    console.log(`feed name: ${name} \ncurrent user: ${readConfig().currentUserName}`)
}
    
export async function followHandler(userId: string, url: string): Promise<void> {
    if (!url) {
        throw new Error("URL must be provided for follow command");
    }

    const feedId = await getFeedIdByUrl(url);
    if (!feedId) {
        throw new Error(`Feed with URL ${url} does not exist. Please add the feed first.`);
    }
    
    const feedFollow = await createFeedFollow(feedId, userId);
    console.log(`User ${feedFollow.user_name} is now following feed ${feedFollow.feed_name}`);
}

export async function followingHandler(userId: string): Promise<void> {
    
    const feeds = await getFeedFollowsForUser(userId);

    console.log(`Feeds followed by ${readConfig().currentUserName}:`);
    feeds.forEach(feed => {
        console.log(`* ${feed.name} (${feed.url}) - ${feed.userName}`);
    });
}

export async function unfollowHandler(userId: string, url: string): Promise<void>{
    if (!url){
        throw new Error("url required for unfollow command")
    }
    await deleteFeedFollow(url, readConfig().currentUserName)
}

export async function browseHandler(userId: string, limit: string = "2"): Promise<void> {
    if (Number(limit) < 1){
        throw new Error("limit parameter cant be less than 1")
    }
    const posts = await getPostsForUser(userId, Number(limit));

    for (let post of posts){
        console.log(`${post.title} - url: ${post.url}`);
        console.log(post.description)
    }
}