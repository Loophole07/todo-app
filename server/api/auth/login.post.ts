import db from '~/server/db'
import { users } from '~/server/db/schema'
import { eventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'
import bcrypt from 'bcrypt'

type LoginBody = {
  email: string
  password: string
}

export default eventHandler(async (event) => {
  let body: LoginBody

  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = ''
      event.node?.req.on('data', (chunk: any) => (data += chunk))
      event.node?.req.on('end', () => resolve(data))
      event.node?.req.on('error', reject)
    })
    body = JSON.parse(raw)
  } catch {
    return { success: false, message: 'Invalid request body' }
  }

  const { email, password } = body

  // --- Email ---
  if (!email?.trim()) {
    return { success: false, field: 'email', message: 'Email is required' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { success: false, field: 'email', message: 'Please enter a valid email address' }
  }

  // --- Password ---
  if (!password) {
    return { success: false, field: 'password', message: 'Password is required' }
  }
  if (password.length < 6) {
    return { success: false, field: 'password', message: 'Password must be at least 6 characters' }
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1)

    if (!user) {
      return { success: false, field: 'email', message: 'No account found with this email' }
    }

    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return { success: false, field: 'password', message: 'Incorrect password' }
    }

    const cookieValue = cookie.serialize('user_session', user.id.toString(), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    event.node?.res?.setHeader('Set-Cookie', cookieValue)

    return {
      success: true,
      message: 'Login successful',
      redirect: '/home',
      user: { id: user.id, name: user.name, email: user.email },
    }

  } catch (err) {
    console.error('USER LOGIN ERROR ', err)
    return { success: false, message: 'Server error, try again later' }
  }
})