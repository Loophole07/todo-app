import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return { success: false, message: 'Invalid ID' }

    await db.delete(users).where(eq(users.id, id))

    return { success: true, message: 'User deleted successfully' }
  } catch (err) {
    console.error('DELETE USER ERROR 👉', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete user' })
  }
})
