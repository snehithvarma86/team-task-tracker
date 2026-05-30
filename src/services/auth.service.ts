import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '../db/schema/users';
import { createAppError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

const generateTokens = (user: any) => {
  const payload = { id: user.id, orgId: user.orgId, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const authService = {
  async register(data: any) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      throw createAppError(400, 'USER_EXISTS', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const [newUser] = await db.insert(users).values({
      orgId: data.orgId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'MEMBER',
    }).returning();

    const tokens = generateTokens(newUser);
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, ...tokens };
  },

  async login(data: any) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw createAppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw createAppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const tokens = generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, ...tokens };
  }
};