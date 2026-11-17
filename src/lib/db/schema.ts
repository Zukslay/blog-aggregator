import {uuid, text, pgTable, timestamp, unique} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    lastFetchedAt: timestamp("last_fetched_at"),
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
});

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    feedId: uuid("feed_id").notNull().references(() => feeds.id, {onDelete: "cascade"}),
    userId: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
}, (table) => ({
    unique_feed_user: unique("unique_feed_user").on(table.feedId, table.userId),
}));

export const posts = pgTable("posts",{
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull() ,
    updatedAt: timestamp("created_at").defaultNow().notNull().$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description"),
    publishedAt: timestamp("published_at"),
    feedId: uuid("feed_id").notNull().references(() => feeds.id, {onDelete: "cascade"})
});