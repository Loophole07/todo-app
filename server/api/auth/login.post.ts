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
  } catch (err) {
    return { success: false, message: 'Invalid request body' }
  }

  const { email, password } = body

  if (!email || !password)
    return { success: false, message: 'Email and password are required' }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user)
      return { success: false, message: 'Invalid credentials' }

    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid)
      return { success: false, message: 'Invalid credentials' }

    // Set cookie
    const cookieValue = cookie.serialize('user_session', user.id.toString(), {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    console.log('Setting cookie:', cookieValue)

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