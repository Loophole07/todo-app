import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { categorizeTodo } from '~/server/utils/categorizeTodo'

export default defineEventHandler(async () => {
  const allTodos = await db
    .select({
      title: todos.title,
      description: todos.description,
    })
    .from(todos)

  const categoryCount: Record<string, number> = {}

  allTodos.forEach(todo => {
    const text = `${todo.title} ${todo.description ?? ''}`
    const categories = categorizeTodo(text)

    categories.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
  })

  return {
    success: true,
    data: categoryCount
  }
})
