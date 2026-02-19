import { eventHandler, createError } from 'h3'
import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })
    }

    const [user] = await db
      .select({
        id:    users.id,
        name:  users.name,
        email: users.email,
        // password is intentionally excluded
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return {
      success: true,
      user
    }

  } catch (err: any) {
    console.error('FETCH USER ERROR:', err)
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch user' })
  }
})