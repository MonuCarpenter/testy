import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose-connect";

const COOKIE_NAME = process.env.COOKIE_NAME || "oex_session";
const COOKIE_SECURE = (process.env.COOKIE_SECURE || "false") === "true";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
 
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: any) {
  return (jwt as any).sign(
    payload,
    JWT_SECRET as any,
    { expiresIn: JWT_EXPIRES_IN } as any
  ) as string;
}

export function verifyToken(token: string) {
  return (jwt as any).verify(token, JWT_SECRET as any) as any;
}

export async function setSessionCookie(user: any) {
  const token = signToken({ id: user._id, role: user.role });
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getUserFromRequest() {
  await dbConnect();
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token) as { id: string; role: string };
    const user = await User.findById(payload.id).lean();
    if (!user) return null;
    return {
      id: String((user as any)._id),
      role: (user as any).role,
      email: (user as any).email,
      name: (user as any).name,
    };
  } catch {
    return null;
  }
}
