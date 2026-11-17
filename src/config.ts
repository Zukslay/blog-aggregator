import os from "os";
import fs from "fs";
import path from "path";
const configPath: string = path.join(os.homedir(), ".gatorconfig.json");

export type Config = {
    dbUrl: string;
    currentUserName: string;
}


/* can overwrite user already setted */
export function setUser(user: string = ""): void {
    const config: Config = readConfig();
    config.currentUserName = user;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function readConfig(): Config {
    let configData: string;
    try{
        configData = fs.readFileSync(configPath, "utf-8");
    } catch (err: any) {
        const error = (err as NodeJS.ErrnoException);
        if (error.code === "ENOENT") {
            console.error("Config file not found");
            console.log("Creating default config file...");
            return setConfigDedault();
        } else if (error.code === "EACCES") {
            throw new Error("Permission denied while reading config file");
        } else if (error.code === "EISDIR") {
            throw new Error("Expected a file but found a directory at the config path");
        }
        throw new Error(`Error reading config file: ${error.message}`);
    }

    const configParsed: unknown = JSON.parse(configData);
    const normalizedConfig: Config = normalizeConfig(configParsed);
    
    if (!validateConfig(normalizedConfig)) {
        throw new Error("Invalid config format");
    }
    return normalizedConfig;
}

function setConfigDedault(): Config {
    const defaultConfig: Config = {
        dbUrl: "postgres://example",
        currentUserName: ""
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
}

/* type guard pure */
function validateConfig(config: Config): boolean {
    
    if (!(config.dbUrl.startsWith("postgres://"))) {
        console.error("Invalid dbUrl format. It should start with 'postgres://'");
        return false;
    }
    return true;
}

/* normalize config object */
function normalizeConfig(config: unknown): Config {
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
        throw new Error("Invalid config format; expected an javascript object");
    }
    
    const c = config as Record<string, unknown>;
    return {
        dbUrl: typeof c.dbUrl === "string" ? c.dbUrl : "postgres://example",
        currentUserName: typeof c.currentUserName === "string" ? c.currentUserName : "",
    };
    
}
