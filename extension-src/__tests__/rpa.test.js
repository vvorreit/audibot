// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mock chrome storage ─────────────────────────────────────────────── */

var storageGetMock = vi.fn();
var storageSetMock = vi.fn();
var storageRemoveMock = vi.fn();

vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: storageGetMock,
      set: storageSetMock,
      remove: storageRemoveMock,
    },
  },
});

/* ── Mock globals used by rpa/index.js ───────────────────────────────── */

vi.stubGlobal("showRPAToast", vi.fn());
vi.stubGlobal("replayParcours", vi.fn());
vi.stubGlobal("performSmartFill", vi.fn());

import { checkAndStartRPA } from "../content/rpa/index.js";

/* ══════════════════════════════════════════════════════════════════════════
 *  checkAndStartRPA
 * ══════════════════════════════════════════════════════════════════════════ */
describe("checkAndStartRPA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    /* Default: hostname = "viamedis.com" */
    Object.defineProperty(window, "location", {
      value: { hostname: "viamedis.com", pathname: "/accueil" },
      writable: true,
      configurable: true,
    });
  });

  /* ── Plan-based access control ─────────────────────────────────────── */

  describe("plan-based access control (rpaEnabled flag)", () => {
    it("shows info toast and returns when rpaEnabled is false", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({ optibot_auth: { rpaEnabled: false }, optibot_rpa: { target: "viamedis", ts: Date.now() } });
      });

      checkAndStartRPA();

      expect(globalThis.showRPAToast).toHaveBeenCalledWith(
        expect.stringContaining("plan Pro"),
        "info"
      );
      /* Should NOT proceed to replay or smart fill */
      expect(globalThis.replayParcours).not.toHaveBeenCalled();
      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
    });

    it("proceeds when rpaEnabled is true", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: { rpaEnabled: true },
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      /* Should reach the fallback smart fill path */
      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });

    it("proceeds when rpaEnabled is undefined (not explicitly false)", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.showRPAToast).toHaveBeenCalledWith(
        expect.stringContaining("remplissage automatique"),
        "info"
      );
    });

    it("proceeds when optibot_auth is missing entirely", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });
  });

  /* ── Hostname matching logic ───────────────────────────────────────── */

  describe("hostname matching (includes() check)", () => {
    it("matches when hostname includes rpa.target", () => {
      window.location = { hostname: "www.viamedis.com", pathname: "/accueil" };
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });

    it("matches when hostname includes rpa.targetHostname", () => {
      window.location = { hostname: "portail.almerys.com", pathname: "/home" };
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "other", targetHostname: "almerys.com", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });

    it("does not proceed when hostname matches neither target nor targetHostname", () => {
      window.location = { hostname: "www.google.com", pathname: "/" };
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", targetHostname: "almerys.com", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
      expect(globalThis.showRPAToast).not.toHaveBeenCalled();
    });

    it("matches via target even when targetHostname is empty", () => {
      window.location = { hostname: "viamedis.com", pathname: "/accueil" };
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", targetHostname: "", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });
  });

  /* ── Timestamp expiry boundary (5-minute window) ───────────────────── */

  describe("timestamp expiry (5-minute window)", () => {
    it("proceeds when timestamp is fresh (< 5 minutes)", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() - 1000 },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
      /* storage is also removed in the smart fill fallback path */
    });

    it("proceeds at exactly 5 minutes (boundary — 300000ms is expired)", () => {
      /* Date.now() - rpa.ts > 300000 means strictly greater, so exactly 300000 is NOT expired */
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() - 300000 },
        });
      });

      checkAndStartRPA();

      /* 300000 is NOT > 300000, so it should proceed */
      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });

    it("expires and removes storage when timestamp is older than 5 minutes", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() - 300001 },
        });
      });

      checkAndStartRPA();

      expect(storageRemoveMock).toHaveBeenCalledWith("optibot_rpa");
      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
      expect(globalThis.replayParcours).not.toHaveBeenCalled();
    });

    it("expires when timestamp is very old (1 hour)", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() - 3600000 },
        });
      });

      checkAndStartRPA();

      expect(storageRemoveMock).toHaveBeenCalledWith("optibot_rpa");
      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
    });
  });

  /* ── Storage interaction ───────────────────────────────────────────── */

  describe("storage interaction", () => {
    it("reads optibot_auth and optibot_rpa keys", () => {
      storageGetMock.mockImplementation((keys, cb) => { cb({}); });

      checkAndStartRPA();

      expect(storageGetMock).toHaveBeenCalledWith(
        ["optibot_auth", "optibot_rpa"],
        expect.any(Function)
      );
    });

    it("does nothing when optibot_rpa is missing from storage", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({ optibot_auth: {} });
      });

      checkAndStartRPA();

      expect(globalThis.showRPAToast).not.toHaveBeenCalled();
      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
    });

    it("does nothing when optibot_rpa has no target", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({ optibot_auth: {}, optibot_rpa: { ts: Date.now() } });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
    });

    it("removes optibot_rpa from storage before launching parcours replay", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: {
            target: "viamedis",
            ts: Date.now(),
            parcours: { etapes: [{ action: "click", selector: "#btn" }] },
            payload: { nom: "DUPONT" },
          },
        });
      });

      checkAndStartRPA();

      expect(storageRemoveMock).toHaveBeenCalledWith("optibot_rpa");
      expect(globalThis.replayParcours).toHaveBeenCalledWith(
        { etapes: [{ action: "click", selector: "#btn" }] },
        { nom: "DUPONT" }
      );
    });

    it("removes optibot_rpa from storage before fallback smart fill", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(storageRemoveMock).toHaveBeenCalledWith("optibot_rpa");
      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });
  });

  /* ── Parcours replay vs Smart Fill fallback ────────────────────────── */

  describe("parcours replay vs smart fill fallback", () => {
    it("calls replayParcours when parcours with etapes is present", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: {
            target: "viamedis",
            ts: Date.now(),
            parcours: { etapes: [{ action: "fill", selector: "#nom", value: "{{nom}}" }] },
            payload: { patient: "test" },
          },
        });
      });

      checkAndStartRPA();

      expect(globalThis.replayParcours).toHaveBeenCalledWith(
        { etapes: [{ action: "fill", selector: "#nom", value: "{{nom}}" }] },
        { patient: "test" }
      );
      expect(globalThis.performSmartFill).not.toHaveBeenCalled();
    });

    it("falls back to performSmartFill when parcours is absent", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.performSmartFill).toHaveBeenCalled();
      expect(globalThis.replayParcours).not.toHaveBeenCalled();
    });

    it("falls back to performSmartFill when parcours has no etapes", () => {
      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now(), parcours: {} },
        });
      });

      checkAndStartRPA();

      /* parcours is truthy but parcours.etapes is falsy, so the
         condition `rpa.parcours && rpa.parcours.etapes` is false → fallback to smart fill */
      expect(globalThis.replayParcours).not.toHaveBeenCalled();
      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });
  });

  /* ── Login page detection ──────────────────────────────────────────── */

  describe("login page detection", () => {
    it("shows login toast and sets login_shown when on a login page", () => {
      window.location = { hostname: "viamedis.com", pathname: "/login" };

      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.showRPAToast).toHaveBeenCalledWith(
        expect.stringContaining("connectez-vous"),
        "info"
      );
      expect(storageSetMock).toHaveBeenCalledWith(
        expect.objectContaining({
          optibot_rpa: expect.objectContaining({ login_shown: true }),
        })
      );
    });

    it("skips login detection when login_shown is already set", () => {
      window.location = { hostname: "viamedis.com", pathname: "/login" };

      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now(), login_shown: true },
        });
      });

      checkAndStartRPA();

      /* Should proceed past login check to the smart fill fallback */
      expect(globalThis.performSmartFill).toHaveBeenCalled();
    });

    it("detects login page via password input in DOM", () => {
      window.location = { hostname: "viamedis.com", pathname: "/accueil" };
      var pwdInput = document.createElement("input");
      pwdInput.type = "password";
      document.body.appendChild(pwdInput);

      storageGetMock.mockImplementation((keys, cb) => {
        cb({
          optibot_auth: {},
          optibot_rpa: { target: "viamedis", ts: Date.now() },
        });
      });

      checkAndStartRPA();

      expect(globalThis.showRPAToast).toHaveBeenCalledWith(
        expect.stringContaining("connectez-vous"),
        "info"
      );

      /* Cleanup */
      pwdInput.remove();
    });
  });
});
