import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { categorizeTodo } from '~/server/utils/categorizeTodo'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  try {
    // Fetch all todos with user_id
    const allTodos = await db
      .select({
        title: todos.title,
        description: todos.description,
      })
      .from(todos)

    // Build category stats with only counts
    // Format: { category: count }
    const categoryMap: Record<string, number> = {}

    allTodos.forEach(todo => {
      const text = `${todo.title} ${todo.description ?? ''}`
      const categories = categorizeTodo(text)

      categories.forEach(category => {
        categoryMap[category] = (categoryMap[category] || 0) + 1
      })
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
