"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getUserId(session: Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.id ?? null;
}
