import { describe, it, expect, vi, beforeEach } from "vitest";

/* ─── Mocks hoisted ────────────────────────────────────────────────────── */
const mocks = vi.hoisted(() => {
  const notificationCreate = vi.fn();
  const notificationFindMany = vi.fn();
  const notificationUpdateMany = vi.fn();
  const userFindUnique = vi.fn();
  const getServerSession = vi.fn();

  return {
    notificationCreate,
    notificationFindMany,
    notificationUpdateMany,
    userFindUnique,
    getServerSession,
  };
});

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

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

/* ─── Import après mocks ────────────────────────────────────────────────── */
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notifications";

/* ─── Fixtures fictives (zéro donnée patient réelle) ───────────────────── */
const FAKE_USER_ID = "usr_test_0001";
const FAKE_EMAIL = "utilisateur-fictif@example.com";

const FAKE_NOTIFICATIONS = [
  {
    id: "notif_001",
    type: "INFO",
    title: "Bienvenue",
    message: "Votre compte a été créé.",
    read: false,
    link: null,
    createdAt: new Date("2026-03-20T10:00:00Z"),
  },
  {
    id: "notif_002",
    type: "ALERTE",
    title: "Renouvellement",
    message: "Votre abonnement expire dans 7 jours.",
    read: true,
    link: "/dashboard/account",
    createdAt: new Date("2026-03-19T08:00:00Z"),
  },
  {
    id: "notif_003",
    type: "SUCCES",
    title: "Injection réussie",
    message: "L'injection automatique a bien fonctionné.",
    read: false,
    link: null,
    createdAt: new Date("2026-03-18T12:00:00Z"),
  },
];

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crée une notification avec userId valide et sans link", async () => {
    mocks.notificationCreate.mockResolvedValueOnce({});

    await createNotification(FAKE_USER_ID, "INFO", "Titre test", "Message test");

    expect(mocks.notificationCreate).toHaveBeenCalledOnce();
    expect(mocks.notificationCreate).toHaveBeenCalledWith({
      data: {
        userId: FAKE_USER_ID,
        type: "INFO",
        title: "Titre test",
        message: "Message test",
        link: null,
      },
    });
  });

  it("crée une notification avec un link optionnel", async () => {
    mocks.notificationCreate.mockResolvedValueOnce({});

    await createNotification(
      FAKE_USER_ID,
      "ALERTE",
      "Abonnement",
      "Expiration prochaine",
      "/dashboard/account"
    );

    expect(mocks.notificationCreate).toHaveBeenCalledWith({
      data: {
        userId: FAKE_USER_ID,
        type: "ALERTE",
        title: "Abonnement",
        message: "Expiration prochaine",
        link: "/dashboard/account",
      },
    });
  });

  it("utilise null quand link est undefined", async () => {
    mocks.notificationCreate.mockResolvedValueOnce({});

    await createNotification(FAKE_USER_ID, "SUCCES", "OK", "Opération réussie", undefined);

    const call = mocks.notificationCreate.mock.calls[0][0];
    expect(call.data.link).toBe(null);
  });
});

describe("getNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    /* Session fictive */
    mocks.getServerSession.mockResolvedValue({
      user: { email: FAKE_EMAIL },
    });
    mocks.userFindUnique.mockResolvedValue({ id: FAKE_USER_ID });
  });

  it("retourne les notifications triées (non lues en premier)", async () => {
    /* Prisma renvoie déjà les données triées (orderBy côté DB) */
    const sorted = [
      FAKE_NOTIFICATIONS[0], // read: false
      FAKE_NOTIFICATIONS[2], // read: false
      FAKE_NOTIFICATIONS[1], // read: true
    ];
    mocks.notificationFindMany.mockResolvedValueOnce(sorted);

    const result = await getNotifications();

    expect(result).toHaveLength(3);
    /* Les deux premières doivent être non lues */
    expect(result[0].read).toBe(false);
    expect(result[1].read).toBe(false);
    /* La dernière est lue */
    expect(result[2].read).toBe(true);
  });

  it("appelle prisma.notification.findMany avec le bon userId et le bon orderBy", async () => {
    mocks.notificationFindMany.mockResolvedValueOnce([]);

    await getNotifications();

    expect(mocks.notificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: FAKE_USER_ID },
        orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      })
    );
  });

  it("retourne un tableau vide si la session est absente", async () => {
    mocks.getServerSession.mockResolvedValueOnce(null);

    const result = await getNotifications();
    expect(result).toEqual([]);
  });

  it("retourne un tableau vide si l'utilisateur est introuvable en DB", async () => {
    mocks.userFindUnique.mockResolvedValueOnce(null);

    const result = await getNotifications();
    expect(result).toEqual([]);
  });
});

describe("markAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue({ user: { email: FAKE_EMAIL } });
    mocks.userFindUnique.mockResolvedValue({ id: FAKE_USER_ID });
  });

  it("marque une notification comme lue", async () => {
    mocks.notificationUpdateMany.mockResolvedValueOnce({ count: 1 });

    await markAsRead("notif_001");

    expect(mocks.notificationUpdateMany).toHaveBeenCalledWith({
      where: { id: "notif_001", userId: FAKE_USER_ID },
      data: { read: true },
    });
  });
});

describe("markAllAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue({ user: { email: FAKE_EMAIL } });
    mocks.userFindUnique.mockResolvedValue({ id: FAKE_USER_ID });
  });

  it("marque toutes les notifications non lues comme lues", async () => {
    mocks.notificationUpdateMany.mockResolvedValueOnce({ count: 3 });

    await markAllAsRead();

    expect(mocks.notificationUpdateMany).toHaveBeenCalledWith({
      where: { userId: FAKE_USER_ID, read: false },
      data: { read: true },
    });
  });
});
