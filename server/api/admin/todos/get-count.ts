// server/api/todos/get-count.ts
import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const result = await db
    .select({ totalTodos: sql<number>`COUNT(*)` })
    .from(todos)
    .limit(1)

  const totalTodos = Number(result[0]?.totalTodos ?? 0) // safe fallback

  return { success: true, totalTodos }
})
