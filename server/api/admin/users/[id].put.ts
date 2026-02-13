import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

type UpdateBody = { name: string; email: string }

const readJsonBody = async <T>(event: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = ''
    event.req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    event.req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch (err) { reject(err) }
    })
    event.req.on('error', reject)
  })
}

export default eventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)
    if (!id) return { success: false, message: 'Invalid ID' }

    const body = await readJsonBody<UpdateBody>(event)
    if (!body?.name || !body?.email) {
      return { success: false, message: 'Name and email required' }
    }

    await db.update(users)
      .set({ name: body.name, email: body.email })
      .where(eq(users.id, id))

    return { 
      success: true, 
      message: 'User updated successfully',
      redirectUrl: '/admin/index'
    }
    
  } catch (err) {
    console.error('UPDATE USER ERROR ', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
  }
})