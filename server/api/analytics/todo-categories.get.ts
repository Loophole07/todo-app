import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { defineEventHandler } from 'h3'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    // Fetch category from todos
    const allTodos = await db
      .select({
        category: todos.category,
      })
      .from(todos)
      .where(eq(todos.completed, false)) // optional: remove if not needed

    // Build category → count map
    const categoryMap: Record<string, number> = {}

    allTodos.forEach(todo => {
      if (!todo.category) return

      categoryMap[todo.category] =
        (categoryMap[todo.category] || 0) + 1
    })

    return {
      success: true,
      data: categoryMap,
    }
  } catch (err) {
    console.error('CATEGORY STATS FETCH ERROR', err)
    return {
      success: false,
      data: {},
      message: 'Failed to fetch category stats',
    }
  }
})
