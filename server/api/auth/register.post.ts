import db from '~/server/db'
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { eventHandler, createError } from 'h3'
import { eq } from 'drizzle-orm'

type RegisterBody = {
  name: string
  email: string
  password: string
}

// 🔥 Manual body reader (version-safe)
const readJsonBody = async <T>(event: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = ''

    event.req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })

    event.req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (err) {
        reject(err)
      }
    })

    event.req.on('error', reject)
  })
}

export default eventHandler(async (event) => {
  try {
    const body = await readJsonBody<RegisterBody>(event)

    const { name, email, password } = body

    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required' }
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, message: 'Email already registered' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      name,
      email,
      password_hash: hashedPassword,
    })

    return { success: true, message: 'User registered successfully' }
  } catch (err) {
    console.error('REGISTER ERROR 👉', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed',
    })
  }
})
