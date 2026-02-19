import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'

type UpdateBody = {
  name: string
  email: string
  password?: string
}

export default eventHandler(async (event) => {
  try {
    // --- ID Check ---
    const id = Number(event.context.params?.id)
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })
    }

    // --- Parse Body ---
    let body: UpdateBody
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        let data = ''
        event.node?.req.on('data', (chunk: any) => (data += chunk))
        event.node?.req.on('end', () => resolve(data))
        event.node?.req.on('error', reject)
      })
      body = JSON.parse(raw)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
    }

    // --- Name Validation ---
    if (!body.name?.trim()) {
      return { success: false, field: 'name', message: 'Name is required' }
    }
    if (body.name.trim().length < 2) {
      return { success: false, field: 'name', message: 'Name must be at least 2 characters' }
    }
    if (body.name.trim().length > 50) {
      return { success: false, field: 'name', message: 'Name must be less than 50 characters' }
    }

    // --- Email Validation ---
    if (!body.email?.trim()) {
      return { success: false, field: 'email', message: 'Email is required' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email.trim())) {
      return { success: false, field: 'email', message: 'Invalid email format' }
    }

    // --- Password Validation (optional) ---
    if (body.password !== undefined && body.password !== '') {
      if (body.password.length < 6) {
        return { success: false, field: 'password', message: 'Password must be at least 6 characters' }
      }
      if (body.password.length > 100) {
        return { success: false, field: 'password', message: 'Password must be less than 100 characters' }
      }
    }

    // --- Existence Check ---
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!existingUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // --- Build update payload ---
    const updateData: Record<string, any> = {
      name:  body.name.trim(),
      email: body.email.trim(),
    }

    // Only hash and update password if provided
    if (body.password && body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    // --- Update ---
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))

    return { success: true, message: 'Profile updated successfully' }

  } catch (err: any) {
    console.error('UPDATE USER ERROR:', err)
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Failed to update user' })
  }
})