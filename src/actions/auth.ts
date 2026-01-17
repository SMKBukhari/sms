"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@/generated/prisma/enums";

// --- Schemas ---

const registerAdminSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  adminCode: z.string().min(1),
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

// --- Actions ---

export async function registerAdmin(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const parseResult = registerAdminSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error("Invalid input data");
  }

  const { username, password, adminCode } = parseResult.data;

  // Verify Admin Code
  if (adminCode !== process.env.ADMIN_SECRET) {
    throw new Error("Invalid Admin Code");
  }

  // Check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error("Username already taken");
  }

  // Hash Password
  const hashedPassword = await hashPassword(password);

  // Create User
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Create Session
  await createSession({ id: user.id, role: user.role });

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const parseResult = loginSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error("Invalid input");
  }

  const { username, password } = parseResult.data;

  // Find User
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verify Password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // Create Session
  await createSession({ id: user.id, role: user.role });

  redirect("/dashboard");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
