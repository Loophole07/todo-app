import db from '~/server/db'
import { users } from '~/server/db/schema'
import { defineEventHandler } from 'h3'
import { todos } from '~/server/db/schema'
import { categorizeTodo } from '~/server/utils/categorizeTodo'

export default defineEventHandler(async (event) => {
  try {
    // --- Get category from query ---
    const url = new URL(event.req.url!, 'http://localhost') // base required for URL parsing
    const category = url.searchParams.get('category')

    if (!category) {
      return { success: false, users: [], message: 'Category is required' }
    }

    // --- Fetch all todos with user IDs ---
    const allTodos = await db.select({
      title: todos.title,
      description: todos.description,
      user_id: todos.user_id
    }).from(todos)

    // --- Collect user IDs for the category ---
    const categorizedUserIds = new Set<number>()

    allTodos.forEach(todo => {
      const text = `${todo.title} ${todo.description ?? ''}`
      const categories = categorizeTodo(text)

      if (categories.includes(category) && todo.user_id !== null) {
        categorizedUserIds.add(todo.user_id)
      }
    })

    // --- Fetch users matching those IDs ---
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    }).from(users)

    const filteredUsers = allUsers.filter(u => categorizedUserIds.has(u.id))

    return {
      success: true,
      users: filteredUsers
    }
  } catch (err) {
    console.error('CATEGORY USERS FETCH ERROR', err)
    return {
      success: false,
      users: [],
      message: 'Failed to fetch users for category'
    }
  }
})
