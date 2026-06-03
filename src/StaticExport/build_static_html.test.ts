import {
  build_static_html,
  make_static_html_filename,
  StaticBaDoc,
} from "./build_static_html";

const makeDoc = (text: string): StaticBaDoc => ({
  version: 3,
  title: "Sample",
  drawOrder: ["a"],
  itemStore: {
    a: {
      id: "a",
      type: "kozane",
      text,
      position: [0, 0],
      scale: 1,
    },
  },
  annotations: [],
});

describe("build_static_html", () => {
  test("embeds Ba JSON without allowing text to close the data script", () => {
    const html = build_static_html(makeDoc("</script><script>alert(1)</script>"), {
      title: "Danger <Title>",
      exportedAt: new Date("2026-06-03T00:00:00.000Z"),
    });

    expect(html).toContain("Danger &lt;Title&gt;");
    expect(html).toContain("\\u003c/script\\u003e");
    expect(html).not.toContain("</script><script>alert(1)</script>");
    expect(html).toContain('"viewer":"static-html-mvp"');
    expect(html).toContain("2026-06-03T00:00:00.000Z");
  });
});

describe("make_static_html_filename", () => {
  test("uses a filesystem-safe title and ISO date", () => {
    expect(
      make_static_html_filename(
        'A/B: C * "D"',
        new Date("2026-06-03T12:34:56.000Z")
      )
    ).toBe("A-B-C-D-2026-06-03.html");
  });

  test("falls back when the title is empty", () => {
    expect(
      make_static_html_filename("", new Date("2026-06-03T12:34:56.000Z"))
    ).toBe("kozaneba-2026-06-03.html");
  });
});
