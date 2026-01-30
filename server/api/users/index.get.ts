import db from '~/server/db'
import { users } from '~/server/db/schema';

export default defineEventHandler(async () => {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users);

    return {
      success: true,
      users: result,
    };
  } catch (error) {
    console.error('FETCH USERS ERROR ', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users',
    });
  }
});
