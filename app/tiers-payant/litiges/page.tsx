export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LitigesClient from "./LitigesClient";

export default async function LitigesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  return <LitigesClient />;
}
