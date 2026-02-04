import { pgTable, serial, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
})

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  completed: boolean('completed').default(false),
  start_date: timestamp('start_date').default(sql`NOW()`),
  due_date: timestamp('due_date'),
  user_id: integer('user_id').references(() => users.id),
})

export const admin = pgTable('admin', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
})