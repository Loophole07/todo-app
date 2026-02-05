import type { SessionConfig } from 'h3'

export const sessionConfig: SessionConfig = {
  password: 'super-secret-key-change-this-123456789', // must be long
  name: 'todo-session',
  cookie: {
    httpOnly: true,
    secure: false, // true in production (https)
    sameSite: 'lax',
  },
}
