/**
 * Tests — escapeHtml (XSS prevention)
 */
import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/lib/escapeHtml";

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns string without special chars unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });

  it("escapes all special characters in a combined string", () => {
    expect(escapeHtml(`<script>alert("xss" & 'hack')</script>`)).toBe(
      "&lt;script&gt;alert(&quot;xss&quot; &amp; &#039;hack&#039;)&lt;/script&gt;"
    );
  });

  it("escapes multiple consecutive ampersands", () => {
    expect(escapeHtml("&&&&")).toBe("&amp;&amp;&amp;&amp;");
  });

  it("handles strings with only special characters", () => {
    expect(escapeHtml("<>\"'&")).toBe("&lt;&gt;&quot;&#039;&amp;");
  });

  it("preserves whitespace and newlines", () => {
    expect(escapeHtml("line1\nline2\ttab")).toBe("line1\nline2\ttab");
  });
});
