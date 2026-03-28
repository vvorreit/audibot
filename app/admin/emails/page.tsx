export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import EmailsClient from "./EmailsClient";

export const metadata = { title: "Emails — Admin OptiBot" };

export default async function AdminEmailsPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
    if (user?.role !== "ADMIN") redirect("/dashboard");
  } catch (e) {
    // redirect() throws internally — laisser propager
    throw e;
  }
  return <EmailsClient />;
}
