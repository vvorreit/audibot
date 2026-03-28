import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    isPro?: boolean;
    plan?: string;
    pendingPlan?: string | null;
    clientCount?: number;
    teamId?: string;
    teamRole?: string;
    metier?: string | null;
    onboardingCompleted?: boolean;
    rechercheMasquee?: boolean;
    syncToken?: string | null;
    dpaAccepted?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      isPro: boolean;
      plan: string;
      pendingPlan?: string | null;
      clientCount: number;
      teamId?: string;
      teamRole?: string;
      metier?: string | null;
      onboardingCompleted: boolean;
      rechercheMasquee: boolean;
    } & DefaultSession["user"];
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isPro?: boolean;
    plan?: string;
    pendingPlan?: string | null;
    clientCount?: number;
    teamId?: string;
    teamRole?: string;
    metier?: string | null;
    onboardingCompleted?: boolean;
    rechercheMasquee?: boolean;
    dpaAccepted?: boolean;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
