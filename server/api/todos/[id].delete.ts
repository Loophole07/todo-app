import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    const userId = event.context.userId as number

    if (!id) return { success: false, message: 'Invalid todo ID' }

    
    const deleted = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.user_id, userId)))

    if (!deleted) {
      return { success: false, message: 'Todo not found or not yours' }
    }

    return { success: true, message: 'Todo deleted successfully' }
  } catch (err) {
    console.error('DELETE TODO ERROR 👉', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete todo' })
  }
})
