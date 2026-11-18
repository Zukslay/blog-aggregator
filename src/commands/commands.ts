import {readConfig, setUser} from '../config.js';
import {createUser, getUser} from '../lib/db/queries/users/users.js';
import { getUsers } from '../lib/db/queries/users/getusers.js';
import {truncateUsers, truncateFeeds} from '../lib/db/queries/delete.js';
import {getFeeds } from '../lib/db/queries/feeds/getfeeds.js';
import { scrapeFeeds, records } from '../lib/db/queries/fetchfeedco.js';


export type CommandHandler = (...args: string[]) => Promise<void>;
export const registry: CommandsRegistry = {};

const descriptions: Record<string, string> = {
    "help": "logs all commands",
    "login": "logs in user",
    "register": "register a username",
    "reset": "resets the database",
    "users": "shows all users",
    "agg": "loops over the feeds",
    "feeds": "shows all feeds",
    "addfeed": "addfeed for current user. required feedname and feedurl",
    "follow": "follow a feed for the current user. required feed url",
    "following": "prints all feeds followed by current user",
    "unfollow": "unfollow a feed for the current user. required feed url",
    "browse": "shows posts from a feed followed by the user, limit command optional"
}

export type CommandsRegistry = Record<string, CommandHandler>;

export async function Help(): Promise<void> {
    for (let [key, _] of Object.entries(registry)){
        console.log(`${key}: ${descriptions[key]}`)
    }
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}
export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    return await registry[cmdName](...args);
}
export async function handlerLogin(...args:string[]): Promise<void> {
    if (args.length < 1) {
        throw new Error("Username expected for login command");
    }
    const user = await getUser(args[0]);
    if (!user) {
        throw new Error(`User ${args[0]} does not exist. Please register first.`);
    }
    setUser(args[0]);
    console.log(`User ${args[0]} has been set`);
}
export async function register(...args: string[]): Promise<void> {
    if (args.length < 1) {
        throw new Error("Username expected for register command");
    }
    const username = args[0];
    await createUser(username);
    setUser(username);
    console.log(`User ${username} has been registered and set as current user`);
}

export async function reset(): Promise<void> {
    await truncateUsers();
    await truncateFeeds();
    console.log("All users have been deleted");
}

export async function users(): Promise<void> {
    const allUsers = await getUsers();
    const currentUser = readConfig().currentUserName;
    console.log("Registered users:");
    allUsers.forEach(user => {
        const isCurrent = user.name === currentUser ? " (current)" : "";
        console.log(`* ${user.name}${isCurrent}`);
    });
    
}

export async function aggFetch(timeBetweenReqs: string): Promise<void> {
    if (!timeBetweenReqs){
        throw new Error("time required for agg command")
    }
    const timeMs = parseDurationMs(timeBetweenReqs);
    console.log(`Collecting feeds every ${timeBetweenReqs}`)
    await scrapeFeeds(records).catch((err) => {console.error(err)})
    let running = false;

    const interval = setInterval(async () => {
        if (running){
            return
        }
        running = true;
        await scrapeFeeds(records).catch((err) => {console.error(err)});
        running = false;
        }, timeMs);

    await new Promise<void>((resolve) => {
        process.once("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
            process.exit(0);
        });
    });
}


export async function listFeeds(): Promise<void> {
    const feeds = await getFeeds();
    console.log("Registered feeds:");
    feeds.forEach(feed => {
        console.log(`* ${feed.name} (${feed.url}) - ${feed.userName}`);
    });
}


function parseDurationMs(durationStr: String): number {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match){
        throw new Error("timeBetweenReqs doesnt match the format")
    }
    const [, value, unit] = match;
    const multipliers = { 'ms': 1, 's': 1000, 'm': 60_000, 'h': 3_600_000 } as Record<string, number>;
    return Number(value) * multipliers[unit]
}


