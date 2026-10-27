import { describe, expect, it } from "vitest";
import { is_image_url } from "./is_image_url";

describe("is_image_url", () => {
  it("accepts Gyazo pages", () => {
    expect(
      is_image_url("https://gyazo.com/8ff159b59dab5e5e600faa314eafda28"),
    ).toBe(true);
  });

  it("accepts Firebase Storage download URLs", () => {
    expect(
      is_image_url(
        "https://firebasestorage.googleapis.com/v0/b/regroup-d4932.firebasestorage.app/o/images%2Fuid%2Fa.png?alt=media&token=abc",
      ),
    ).toBe(true);
  });

  it("accepts common image extensions, ignoring the query", () => {
    expect(is_image_url("https://example.com/a.png")).toBe(true);
    expect(is_image_url("https://example.com/a.JPG")).toBe(true);
    expect(is_image_url("https://example.com/a.jpeg?w=100")).toBe(true);
    expect(is_image_url("https://example.com/a.gif")).toBe(true);
    expect(is_image_url("https://example.com/a.webp")).toBe(true);
  });

  it("keeps the old rule that a trailing .png makes an image", () => {
    // Used for favicons: append "#.png" to the URL.
    expect(
      is_image_url(
        "http://www.google.com/s2/favicons?domain=google.com&sz=256#.png",
      ),
    ).toBe(true);
  });

  it("rejects pages and non-URLs", () => {
    expect(is_image_url("https://example.com/")).toBe(false);
    expect(is_image_url("https://scrapbox.io/nishio/Kozaneba")).toBe(false);
    expect(is_image_url("javascript:alert(1)//.jpg")).toBe(false);
  });
});
