import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";

const SECRET_KEY = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(SECRET_KEY);

if (!SECRET_KEY) {
  throw new Error("SESSION_SECRET is not set in .env");
}

export type SessionPayload = {
  userId: string;
  role: Role;
  exp: number;
};

// --- Password Security ---

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// --- Session Management ---

export async function createSession(user: { id: string; role: Role }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("schola_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("schola_session")?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });

    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("schola_session");
}

// --- Auth Utilities ---

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(
  allowedRoles: Role[],
): Promise<SessionPayload> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}
