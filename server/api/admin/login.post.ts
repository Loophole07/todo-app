import db from '~/server/db'
import { admin } from '~/server/db/schema'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

type AdminLoginBody = {
  email: string
  password: string
}

export default eventHandler(async (event) => {
  let body: AdminLoginBody

  try {
    // --- Safely read raw request body ---
    const raw = await new Promise<string>((resolve, reject) => {
      let data = ''
      event.node?.req.on('data', (chunk: any) => {
        data += chunk
      })
      event.node?.req.on('end', () => resolve(data))
      event.node?.req.on('error', (err: any) => reject(err))
    })

    body = JSON.parse(raw)
  } catch (err) {
    return { success: false, message: 'Invalid JSON body' }
  }

  const { email, password } = body

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  try {
    // --- Find admin by email ---
    const [adminUser] = await db
      .select()
      .from(admin)
      .where(eq(admin.email, email))
      .limit(1)

    if (!adminUser) return { success: false, message: 'Invalid credentials' }

    // --- Plain-text password check ---
    if (password !== adminUser.password_hash) {
      return { success: false, message: 'Invalid credentials' }
    }

    return {
      success: true,
      message: 'Login successful',
      admin: { id: adminUser.id, username: adminUser.username, email: adminUser.email },
    }
  } catch (error: any) {
    console.error('ADMIN LOGIN ERROR 👉', error)
    return createError({ statusCode: 500, statusMessage: 'Login failed' })
  }
})
