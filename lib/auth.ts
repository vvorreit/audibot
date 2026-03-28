import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail, smtpConfigured } from "@/lib/mailer";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { id: user.id, email: user.email, name: user.name, image: user.image } as any;
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Premier login Google : stocker les tokens
      if (account && account.provider === "google") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
      }

      if (user) {
        token.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { team: true },
        });

        token.role = dbUser?.role ?? "USER";
        token.clientCount = dbUser?.clientCount ?? 0;
        token.teamId = dbUser?.teamId ?? undefined;
        token.teamRole = dbUser?.teamRole ?? undefined;
        token.plan = dbUser?.plan ?? "FREE";
        token.pendingPlan = dbUser?.pendingPlan ?? null;

        const isTeamPro = dbUser?.team?.plan === "EQUIPE" || dbUser?.team?.plan === "PRO" || dbUser?.team?.plan === "ENTERPRISE";
        const isFreeActive = dbUser?.freeUntil && new Date(dbUser.freeUntil) > new Date();
        token.isPro = dbUser?.isPro || isTeamPro || !!isFreeActive;
        if (isFreeActive && dbUser?.plan === "FREE") {
          token.plan = "PRO";
        }

        // Vérification acceptation DPA (RGPD Art. 28)
        // Note: documentType stocké en minuscule "dpa" (auth.ts) ou majuscule "DPA" (admin) → chercher les deux
        const dpaAcceptance = await prisma.legalAcceptance.findFirst({
          where: { userId: user.id, documentType: { in: ["dpa", "DPA"] } },
        });
        token.dpaAccepted = !!dpaAcceptance;

        // Vérification acceptation CGV
        // Note: documentType stocké en majuscule "CGV" (legal.ts) → chercher les deux par sécurité
        const cgvAcceptance = await prisma.legalAcceptance.findFirst({
          where: { userId: user.id, documentType: { in: ["cgv", "CGV"] } },
        });
        token.cgvAccepted = !!cgvAcceptance;
      }

      if (trigger === "update" && session) {
        // Mettre à jour les flags légaux sans re-query BDD
        if (session.dpaAccepted !== undefined) {
          token.dpaAccepted = session.dpaAccepted;
        }
        if (session.cgvAccepted !== undefined) {
          token.cgvAccepted = session.cgvAccepted;
        }
        return { ...token, ...session };
      }

      // Refresh automatique du token Google si expiré
      if (
        token.refreshToken &&
        token.accessTokenExpires &&
        Date.now() >= (token.accessTokenExpires as number)
      ) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });
          const refreshed = await response.json();
          if (!response.ok) throw refreshed;
          token.accessToken = refreshed.access_token;
          token.accessTokenExpires = Date.now() + refreshed.expires_in * 1000;
          if (refreshed.refresh_token) {
            token.refreshToken = refreshed.refresh_token;
          }
        } catch {
          token.error = "RefreshAccessTokenError";
        }
      }

      // Invalider le token si le mot de passe a été changé après l'émission du token
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { passwordChangedAt: true },
        });
        const tokenIssuedMs = ((token.iat as number) ?? 0) * 1000;
        if (dbUser?.passwordChangedAt && dbUser.passwordChangedAt.getTime() > tokenIssuedMs) {
          return { ...token, error: "SessionInvalidated" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isPro = token.isPro as boolean;
        session.user.clientCount = token.clientCount as number;
        session.user.teamId = token.teamId;
        session.user.teamRole = token.teamRole;
        session.user.plan = token.plan as string;
        session.user.pendingPlan = token.pendingPlan;
        session.error = token.error;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      if (smtpConfigured() && user.email) {
        try {
          await sendWelcomeEmail(user.email, user.name || "");
        } catch (err) {
          console.error("[auth] Erreur envoi welcome email:", err);
        }
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 60 * 60,
  },
};
