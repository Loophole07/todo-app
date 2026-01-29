import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import bcrypt from 'bcrypt';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  try {
    // ✅ Read request body
    const body = await readBody<RegisterBody>(event);
    console.log('Register body received:', body);

    const { name, email, password } = body;

    // ✅ Basic validation
    if (!name || !email || !password) {
      console.log('Validation failed: missing fields');
      return { success: false, message: 'All fields are required.' };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('Validation failed: invalid email');
      return { success: false, message: 'Invalid email address.' };
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // ✅ Check if email already exists
    const existingUser = await db.select().from(users).where(users.email.eq(email));
    console.log('Existing users with this email:', existingUser);

    if (existingUser.length > 0) {
      console.log('Email already registered');
      return { success: false, message: 'Email already registered.' };
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // ✅ Insert into DB
    const result = await db.insert(users).values({
      name,
      email,
      password_hash: hashedPassword,
    });
    console.log('Insert result:', result);

    return { success: true, message: 'User registered successfully!' };
  } catch (error) {
    console.error('Register API error:', error);
    return { success: false, message: 'Server error. Check server logs.' };
  }
});
