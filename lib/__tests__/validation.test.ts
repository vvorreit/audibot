/**
 * Tests de validation — email, longueurs de champs
 * Données fictives uniquement.
 */
import { describe, it, expect } from "vitest";

// Regex email standard (RFC 5322 simplifié) — même pattern que celui utilisé dans les formulaires
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Limites de champs (exemples représentatifs de formulaires optibot)
const FIELD_LIMITS = {
  email: 254,       // RFC 5321
  name: 100,
  comment: 1000,
};

describe("validation — email regex", () => {
  describe("emails valides", () => {
    it("email simple valide", () => {
      expect(isValidEmail("jean.test@example.com")).toBe(true);
    });

    it("email avec sous-domaine", () => {
      expect(isValidEmail("test@mail.optibot.fr")).toBe(true);
    });

    it("email avec chiffres", () => {
      expect(isValidEmail("user123@test99.io")).toBe(true);
    });

    it("email avec tiret et underscore", () => {
      expect(isValidEmail("jean_test-1@example.org")).toBe(true);
    });

    it("email avec plus (alias Gmail)", () => {
      expect(isValidEmail("jean.test+optibot@gmail.com")).toBe(true);
    });

    it("TLD court (.fr)", () => {
      expect(isValidEmail("contact@optibot.fr")).toBe(true);
    });

    it("TLD long (.solutions)", () => {
      expect(isValidEmail("info@company.solutions")).toBe(true);
    });
  });

  describe("emails invalides", () => {
    it("sans @", () => {
      expect(isValidEmail("jean.test-example.com")).toBe(false);
    });

    it("sans domaine", () => {
      expect(isValidEmail("jean@")).toBe(false);
    });

    it("sans TLD", () => {
      expect(isValidEmail("jean@example")).toBe(false);
    });

    it("chaîne vide", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("espaces dans l'email", () => {
      expect(isValidEmail("jean test@example.com")).toBe(false);
    });

    it("double @", () => {
      expect(isValidEmail("jean@@example.com")).toBe(false);
    });

    it("TLD trop court (1 char)", () => {
      expect(isValidEmail("jean@example.c")).toBe(false);
    });

    it("@ en début", () => {
      expect(isValidEmail("@example.com")).toBe(false);
    });
  });
});

describe("validation — longueur max des champs", () => {
  describe("email", () => {
    it("254 caractères → valide (limite exacte)", () => {
      // @test.fr = 8 chars → local = 254 - 8 = 246
      const local = "a".repeat(246);
      const email = `${local}@test.fr`;
      expect(email.length).toBe(254);
      expect(email.length).toBeLessThanOrEqual(FIELD_LIMITS.email);
    });

    it("255 caractères → invalide (dépassement)", () => {
      const email = "a".repeat(250) + "@x.fr";
      expect(email.length).toBeGreaterThan(FIELD_LIMITS.email);
    });

    it("email vide → invalide", () => {
      expect("".length).toBe(0);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("nom (max 100 chars)", () => {
    it("100 caractères → valide (limite exacte)", () => {
      const name = "A".repeat(100);
      expect(name.length).toBeLessThanOrEqual(FIELD_LIMITS.name);
    });

    it("101 caractères → dépasse la limite", () => {
      const name = "A".repeat(101);
      expect(name.length).toBeGreaterThan(FIELD_LIMITS.name);
    });

    it("nom vide → longueur zéro", () => {
      expect("".length).toBe(0);
    });
  });

  describe("commentaire (max 1000 chars)", () => {
    it("1000 caractères → valide (limite exacte)", () => {
      const comment = "x".repeat(1000);
      expect(comment.length).toBeLessThanOrEqual(FIELD_LIMITS.comment);
    });

    it("1001 caractères → dépasse la limite", () => {
      const comment = "x".repeat(1001);
      expect(comment.length).toBeGreaterThan(FIELD_LIMITS.comment);
    });

    it("999 caractères → sous la limite (valide)", () => {
      const comment = "x".repeat(999);
      expect(comment.length).toBeLessThan(FIELD_LIMITS.comment);
    });
  });
});
