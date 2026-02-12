import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return { success: false, message: 'Invalid ID' }

    const user = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (user.length === 0) {
      return { success: false, message: 'User not found' }
    }

    return { success: true, user: user[0] }
  } catch (err) {
    console.error('GET USER ERROR 👉', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch user' })
  }
})
