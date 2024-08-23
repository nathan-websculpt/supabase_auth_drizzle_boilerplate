import { InferSelectModel, relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "$/db/schema";

export const post = pgTable("post", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  title: varchar("title", { length: 255 }).notNull(),
  shortDescription: text("short_description"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
}));

const baseSchema = createInsertSchema(post, {
  title: (schema) => schema.title.min(1),
  shortDescription: (schema) => schema.shortDescription.min(1).max(255),
  userId: (schema) => schema.userId.min(1),
}).pick({
  title: true,
  shortDescription: true,
  userId: true,
});

export const postSchema = z.union([
  z.object({
    mode: z.literal("create"),
    title: baseSchema.shape.title,
    shortDescription: baseSchema.shape.shortDescription,
    userId: baseSchema.shape.userId,
  }),
  z.object({
    mode: z.literal("edit"),
    id: z.number().min(1),
    title: baseSchema.shape.title,
    shortDescription: baseSchema.shape.shortDescription,
    userId: baseSchema.shape.userId,
  }),
]);

export type PostSchema = z.infer<typeof postSchema>;
export type SelectPostModel = InferSelectModel<typeof post>;
