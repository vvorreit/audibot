/**
 * Tests — emailTemplate (HTML email template rendering)
 */
import { describe, it, expect } from "vitest";
import {
  emailWrapper,
  ctaButton,
  infoBox,
  bodyText,
  h1,
  smallText,
} from "@/lib/emailTemplate";

describe("emailWrapper", () => {
  it("wraps content in a full HTML document", () => {
    const html = emailWrapper({ content: "<p>Hello</p>" });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("</html>");
    expect(html).toContain("<p>Hello</p>");
  });

  it("includes AudiBot branding", () => {
    const html = emailWrapper({ content: "" });
    expect(html).toContain("AudiBot");
    expect(html).toContain("audibot.fr");
  });

  it("includes unsubscribe link when email provided", () => {
    const html = emailWrapper({
      content: "<p>Test</p>",
      unsubscribeEmail: "user@example.com",
    });
    expect(html).toContain("Se d\u00e9sabonner");
    expect(html).toContain(encodeURIComponent("user@example.com"));
    expect(html).toContain("/api/unsubscribe");
  });

  it("omits unsubscribe link when no email provided", () => {
    const html = emailWrapper({ content: "<p>Test</p>" });
    expect(html).not.toContain("Se d\u00e9sabonner");
    expect(html).not.toContain("/api/unsubscribe");
  });

  it("includes contact link in footer when unsubscribe shown", () => {
    const html = emailWrapper({
      content: "",
      unsubscribeEmail: "user@example.com",
    });
    expect(html).toContain("contact@audibot.fr");
  });

  it("includes meta charset and viewport", () => {
    const html = emailWrapper({ content: "" });
    expect(html).toContain('charset="utf-8"');
    expect(html).toContain("viewport");
  });
});

describe("ctaButton", () => {
  it("renders an anchor with correct text and href", () => {
    const html = ctaButton("Commencer", "https://audibot.fr/start");
    expect(html).toContain("Commencer");
    expect(html).toContain('href="https://audibot.fr/start"');
  });

  it("uses inline styles with blue background", () => {
    const html = ctaButton("Click", "https://example.com");
    expect(html).toContain("background:#2563eb");
    expect(html).toContain("color:#ffffff");
  });

  it("renders as an <a> tag", () => {
    const html = ctaButton("Test", "/link");
    expect(html).toMatch(/^<a\s/);
    expect(html).toContain("</a>");
  });
});

describe("infoBox", () => {
  it("wraps content in a styled div", () => {
    const html = infoBox("Information importante");
    expect(html).toContain("Information importante");
    expect(html).toContain("<div");
    expect(html).toContain("border-left:4px solid #2563eb");
  });

  it("uses blue background", () => {
    const html = infoBox("Test");
    expect(html).toContain("background:#eff6ff");
  });
});

describe("bodyText", () => {
  it("wraps text in a paragraph", () => {
    const html = bodyText("Bonjour le monde");
    expect(html).toContain("<p");
    expect(html).toContain("Bonjour le monde");
    expect(html).toContain("</p>");
  });

  it("uses standard body text color", () => {
    const html = bodyText("test");
    expect(html).toContain("color:#475569");
  });
});

describe("h1", () => {
  it("wraps text in an h1 tag", () => {
    const html = h1("Titre principal");
    expect(html).toContain("<h1");
    expect(html).toContain("Titre principal");
    expect(html).toContain("</h1>");
  });

  it("uses bold dark styling", () => {
    const html = h1("Test");
    expect(html).toContain("font-weight:800");
    expect(html).toContain("color:#0f172a");
  });
});

describe("smallText", () => {
  it("renders small gray text", () => {
    const html = smallText("Note de bas de page");
    expect(html).toContain("<p");
    expect(html).toContain("Note de bas de page");
    expect(html).toContain("font-size:12px");
    expect(html).toContain("color:#94a3b8");
  });
});
