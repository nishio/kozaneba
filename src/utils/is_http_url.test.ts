import { is_http_url } from "./is_http_url";

describe("is_http_url", () => {
  test("accepts http and https", () => {
    expect(is_http_url("https://scrapbox.io/nishio/x")).toBe(true);
    expect(is_http_url("http://example.com/a.png")).toBe(true);
  });
  test("rejects other schemes and non-URLs", () => {
    expect(is_http_url("javascript:alert(1)//.png")).toBe(false);
    expect(is_http_url(" JavaScript:alert(1)")).toBe(false);
    expect(is_http_url("data:text/html,<script>1</script>")).toBe(false);
    expect(is_http_url("foo.png")).toBe(false);
    expect(is_http_url("")).toBe(false);
    expect(is_http_url(undefined)).toBe(false);
  });
});
