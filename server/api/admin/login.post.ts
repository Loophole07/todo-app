import db from '~/server/db'
import { admin } from '~/server/db/schema'
import { eventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import cookie from 'cookie'

type AdminLoginBody = {
  email: string
  password: string
}

export default eventHandler(async (event) => {
  let body: AdminLoginBody

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

  try {
    const [adminUser] = await db
      .select()
      .from(admin)
      .where(eq(admin.email, email.trim().toLowerCase()))
      .limit(1)

    if (!adminUser) {
      return { success: false, field: 'email', message: 'No admin account found with this email' }
    }

    if (password !== adminUser.password_hash) {
      return { success: false, field: 'password', message: 'Incorrect password' }
    }

    event.node?.res?.setHeader(
      'Set-Cookie',
      cookie.serialize('admin_session', adminUser.id.toString(), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24,
      })
    )

    return {
      success: true,
      message: 'Login successful',
      redirect: '/admin',
      admin: { id: adminUser.id, username: adminUser.username, email: adminUser.email },
    }

  } catch (err) {
    console.error('ADMIN LOGIN ERROR 👉', err)
    return { success: false, message: 'Server error, try again later' }
  }
})