/**
 * Tests — email-tracking (tracking pixel, link, unsubscribe)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock brand module
vi.mock("@/lib/brand", () => ({
  getBrand: () => ({
    id: "audibot",
    name: "AudiBot",
    domain: "audibot.fr",
    supportEmail: "contact@audibot.fr",
    appUrl: "https://audibot.fr",
    colors: { primary: "#2563eb", secondary: "#3b82f6" },
    lexicon: {
      profession: "Audioprothésiste",
      product: "Verres / Montures",
      document: "Ordonnance",
    },
    features: { hasEyes: true, hasEars: false },
  }),
}));

import {
  getTrackingPixel,
  getTrackingLink,
  getUnsubscribeLink,
  getUnsubscribeFooter,
} from "@/lib/email-tracking";

describe("getTrackingPixel", () => {
  it("returns an invisible 1x1 image tag", () => {
    const html = getTrackingPixel("abc123");
    expect(html).toContain("<img");
    expect(html).toContain('width="1"');
    expect(html).toContain('height="1"');
    expect(html).toContain("display:none");
  });

  it("includes the token in the tracking URL", () => {
    const html = getTrackingPixel("my-token");
    expect(html).toContain("/api/track/open");
    expect(html).toContain("t=my-token");
  });

  it("URL-encodes the token", () => {
    const html = getTrackingPixel("token with spaces&special=chars");
    expect(html).toContain(encodeURIComponent("token with spaces&special=chars"));
    expect(html).not.toContain("token with spaces&special=chars");
  });

  it("uses the brand appUrl as base", () => {
    const html = getTrackingPixel("tok");
    expect(html).toContain("https://audibot.fr/api/track/open");
  });
});

describe("getTrackingLink", () => {
  it("returns a URL with token and destination", () => {
    const url = getTrackingLink("tok-1", "https://example.com/page");
    expect(url).toContain("/api/track/click");
    expect(url).toContain("t=tok-1");
    expect(url).toContain("url=" + encodeURIComponent("https://example.com/page"));
  });

  it("encodes the destination URL", () => {
    const url = getTrackingLink("t", "https://site.com?a=1&b=2");
    expect(url).toContain(encodeURIComponent("https://site.com?a=1&b=2"));
  });

  it("uses the brand appUrl as base", () => {
    const url = getTrackingLink("t", "https://dest.com");
    expect(url.startsWith("https://audibot.fr/api/track/click")).toBe(true);
  });
});

describe("getUnsubscribeLink", () => {
  it("returns a URL to the unsubscribe page with token", () => {
    const url = getUnsubscribeLink("unsub-tok");
    expect(url).toBe("https://audibot.fr/unsubscribe?t=unsub-tok");
  });

  it("encodes special characters in token", () => {
    const url = getUnsubscribeLink("a&b=c");
    expect(url).toContain(encodeURIComponent("a&b=c"));
  });
});

describe("getUnsubscribeFooter", () => {
  it("returns HTML with unsubscribe link", () => {
    const html = getUnsubscribeFooter("footer-tok");
    expect(html).toContain("<a");
    expect(html).toContain("https://audibot.fr/unsubscribe?t=footer-tok");
  });

  it("includes profession from brand lexicon", () => {
    const html = getUnsubscribeFooter("tok");
    expect(html).toContain("audioprothésiste");
  });

  it("includes unsubscribe text in French", () => {
    const html = getUnsubscribeFooter("tok");
    expect(html).toContain("d\u00e9sinscrire");
  });

  it("uses small gray styling", () => {
    const html = getUnsubscribeFooter("tok");
    expect(html).toContain("font-size:11px");
    expect(html).toContain("color:#999");
  });
});
