import db from '~/server/db'
import { users } from '~/server/db/schema'
import bcrypt from 'bcrypt'
import { eventHandler } from 'h3'
import { eq } from 'drizzle-orm'

type LoginBody = {
  email: string
  password: string
}

export default eventHandler(async (event) => {
  let body: LoginBody

  // --- Safely parse JSON body ---
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = ''
      event.node?.req.on('data', (chunk: any) => (data += chunk))
      event.node?.req.on('end', () => resolve(data))
      event.node?.req.on('error', (err: any) => reject(err))
    })

    body = JSON.parse(raw)
  } catch (err) {
    return { success: false, message: 'Invalid request body' }
  }

  const { email, password } = body

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) return { success: false, message: 'Invalid credentials' }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return { success: false, message: 'Invalid credentials' }

    // --- Return success with user info so frontend can redirect ---
    return {
      success: true,
      message: 'Login successful',
      redirect: '/home', // <-- frontend can read this and navigate
      user: { id: user.id, name: user.name, email: user.email },
    }
  } catch (error) {
    console.error('LOGIN ERROR 👉', error)
    return { success: false, message: 'Server error, try again later' }
  }
})
