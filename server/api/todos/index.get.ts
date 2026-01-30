import db from '~/server/db'
import { todos } from '~/server/db/schema'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  try {
    const allTodos = await db.select().from(todos)
    return { success: true, todos: allTodos }
  } catch (err) {
    console.error('FETCH TODOS ERROR 👉', err)
    return { success: false, todos: [] }
  }
})
