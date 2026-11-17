import {XMLParser} from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchRSSFeed(feedUrl: string): Promise<RSSFeed> {
    const response = await fetch(feedUrl, {
        method: "GET",
        headers: {
            "user-agent": "gator"
        }
    });
    const xml: string = await response.text();
    const parser: XMLParser = new XMLParser({processEntities: false});
    const result: any = parser.parse(xml);
    const feed: RSSFeed = normalizeRSSFeed(result);

    return feed;
}

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function normalizeRSSFeed(parsed: any): RSSFeed {
    if (!parsed || !parsed.rss || !parsed.rss.channel) {
        throw new Error("Invalid RSS feed format");
    }
    let channel = parsed.rss.channel;
    if (!channel.title || !channel.link || !channel.description || !channel.item) {
        throw new Error("Invalid RSS channel format");
    }
    channel.item = toArray(channel.item);

    if (typeof channel.title !== "string" || typeof channel.link !== "string" || typeof channel.description !== "string") {
        throw new Error("Invalid RSS channel format; title, link, and description must be strings");
    }
    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: channel.item
                .filter((item: any) => item && item.title && item.link && item.description && item.pubDate)
                .map((item: any) => {
                    if (typeof item.title !== "string" || typeof item.link !== "string" || typeof item.description !== "string" || typeof item.pubDate !== "string") {
                        throw new Error("Invalid RSS item format; all fields must be strings");
                    }
                    return {
                        title: item.title,
                        link: item.link,
                        description: item.description,
                        pubDate: item.pubDate
                    } as RSSItem;
                })
        }
    } as RSSFeed;
}