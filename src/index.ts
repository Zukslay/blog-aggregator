import {setUser, readConfig} from './config.js';
import {Help,
        reset, 
        registerCommand, 
        CommandsRegistry, 
        handlerLogin, 
        runCommand, 
        register, 
        users, 
        aggFetch,
        listFeeds,} from './commands/commands.js';
import { middlewareLoggedIn, addFeedHandler, followHandler, followingHandler, unfollowHandler } from './commands/middleware.js';
import { registry } from './commands/commands.js';



async function main(): Promise<void> {
    
    registerCommand(registry, "help", Help)
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", register);
    registerCommand(registry, "reset", reset);
    registerCommand(registry, "users", users);
    registerCommand(registry, "agg", aggFetch);
    registerCommand(registry, "feeds", listFeeds);
    registerCommand(registry, "addfeed", middlewareLoggedIn(addFeedHandler));
    registerCommand(registry, "follow", middlewareLoggedIn(followHandler));
    registerCommand(registry, "following", middlewareLoggedIn(followingHandler));
    registerCommand(registry, "unfollow", middlewareLoggedIn(unfollowHandler));

    const command: string = process.argv[2];
    if (!command) {
        console.error("not enough arguments were provided.");
        process.exit(1);
    }
    
    const args: string[] = process.argv.slice(3);
    
    try{
        await runCommand(registry, command, ...args);
        process.exit(0);
    } catch (error) {
        console.error("Error occurred while running the command:", error);
        process.exit(1);
    }
}

main();