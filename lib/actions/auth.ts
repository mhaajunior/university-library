"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, message: result.error };
    }

    return { success: true, message: "Signin successful" };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, message: "Signin error" };
  }
};

export const signUp = async (
  params: AuthCredentials
): Promise<{ success: boolean; message: string }> => {
  const { fullName, email, password, universityId, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  // check if the user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, message: "User already exists" };
  }

  const hashPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      password: hashPassword,
      universityId,
      universityCard,
    });

    await signInWithCredentials({ email, password });

    return { success: true, message: "Signup successful" };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, message: "Signup error" };
  }
};
