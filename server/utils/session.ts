import { getSession, updateSession } from 'h3'

export const sessionConfig = {
  password: process.env.SESSION_SECRET || 'super-secret-key-12345678901234567890',
  name: 'todo-session',
}

// get full session
export async function useUserSession(event: any) {
  return await getSession(event, sessionConfig)
}

// set user
export async function setUserSession(event: any, user: any) {
  const session = await getSession(event, sessionConfig)
  session.data.user = user
  await updateSession(event, sessionConfig)
}

// get user only ⭐
export async function getUserFromSession(event: any) {
  const session = await getSession(event, sessionConfig)
  return session.data?.user || null
}

// logout
export async function clearUserSession(event: any) {
  const session = await getSession(event, sessionConfig)
  session.data = {}
  await updateSession(event, sessionConfig)
}
