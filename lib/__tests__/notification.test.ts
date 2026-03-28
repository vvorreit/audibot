import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ───────────���─────────────────────────── */

const mocks = vi.hoisted(() => ({
  notificationCreate: vi.fn(),
  notificationFindMany: vi.fn(),
  notificationUpdateMany: vi.fn(),
  userFindUnique: vi.fn(),
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    notification: {
      create: mocks.notificationCreate,
      findMany: mocks.notificationFindMany,
      updateMany: mocks.notificationUpdateMany,
    },
    user: {
      findUnique: mocks.userFindUnique,
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "@/app/actions/notifications";

describe("Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    it("insère une notification en DB", async () => {
      mocks.notificationCreate.mockResolvedValue({ id: "n1" });

      await createNotification("user_1", "info", "Titre", "Message test", "/link");

      expect(mocks.notificationCreate).toHaveBeenCalledWith({
        data: {
          userId: "user_1",
          type: "info",
          title: "Titre",
          message: "Message test",
          link: "/link",
        },
      });
    });

    it("crée une notification sans link", async () => {
      mocks.notificationCreate.mockResolvedValue({ id: "n2" });

      await createNotification("user_1", "warning", "Alerte", "Attention");

      expect(mocks.notificationCreate).toHaveBeenCalledWith({
        data: {
          userId: "user_1",
          type: "warning",
          title: "Alerte",
          message: "Attention",
          link: null,
        },
      });
    });

    it("ne throw pas si DB échoue (catch interne)", async () => {
      mocks.notificationCreate.mockRejectedValue(new Error("DB error"));

      // Should not throw
      await expect(
        createNotification("user_1", "info", "T", "M")
      ).resolves.toBeUndefined();
    });
  });

  describe("getNotifications", () => {
    it("retourne les notifications triées pour un user authentifié", async () => {
      mocks.getServerSession.mockResolvedValue({
        user: { email: "user@test.fr" },
      });
      mocks.userFindUnique.mockResolvedValue({ id: "user_1" });

      const now = new Date();
      const notifications = [
        { id: "n1", type: "info", title: "New", message: "Msg1", read: false, link: null, createdAt: now },
        { id: "n2", type: "info", title: "Old", message: "Msg2", read: true, link: null, createdAt: new Date(now.getTime() - 1000) },
      ];
      mocks.notificationFindMany.mockResolvedValue(notifications);

      const result = await getNotifications();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("n1");

      // Verify query params
      expect(mocks.notificationFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user_1" },
          take: 20,
        })
      );
    });

    it("retourne [] si non authentifié", async () => {
      mocks.getServerSession.mockResolvedValue(null);

      const result = await getNotifications();
      expect(result).toEqual([]);
    });

    it("retourne [] si user introuvable", async () => {
      mocks.getServerSession.mockResolvedValue({
        user: { email: "unknown@test.fr" },
      });
      mocks.userFindUnique.mockResolvedValue(null);

      const result = await getNotifications();
      expect(result).toEqual([]);
    });
  });

  describe("markAsRead", () => {
    it("met read: true pour la notification donnée", async () => {
      mocks.getServerSession.mockResolvedValue({
        user: { email: "user@test.fr" },
      });
      mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
      mocks.notificationUpdateMany.mockResolvedValue({ count: 1 });

      await markAsRead("n1");

      expect(mocks.notificationUpdateMany).toHaveBeenCalledWith({
        where: { id: "n1", userId: "user_1" },
        data: { read: true },
      });
    });
  });

  describe("markAllAsRead", () => {
    it("met read: true pour toutes les notifications non lues du user", async () => {
      mocks.getServerSession.mockResolvedValue({
        user: { email: "user@test.fr" },
      });
      mocks.userFindUnique.mockResolvedValue({ id: "user_1" });
      mocks.notificationUpdateMany.mockResolvedValue({ count: 5 });

      await markAllAsRead();

      expect(mocks.notificationUpdateMany).toHaveBeenCalledWith({
        where: { userId: "user_1", read: false },
        data: { read: true },
      });
    });
  });
});
