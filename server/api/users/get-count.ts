// server/api/users/get-count.ts
import db from '~/server/db'
import { users } from '~/server/db/schema'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const result = await db
    .select({ totalUsers: sql<number>`COUNT(*)` })
    .from(users)
    .limit(1) // optional, just to ensure a single row

  const totalUsers = Number(result[0]?.totalUsers ?? 0) // safe fallback

  return { success: true, totalUsers }
})
