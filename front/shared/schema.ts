import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { Node } from "@/lib/html-parse";

export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DRAFT = "DRAFT",
}

export interface Info {
  tags?: string[];
  location?: string[];
}

export const entries = pgTable("entry", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),

  content: jsonb("content").$type<Node[]>().default([]).notNull(),
  visibility: text("visibility").default(Visibility.PUBLIC).notNull(),
  payload: jsonb("payload").$type<Info>().default({}).notNull(),
});

export const insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;
