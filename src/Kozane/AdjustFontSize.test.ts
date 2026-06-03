import { adjustFontSize, cache, INITIAL } from "./AdjustFontSize";

const resetCache = () => {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
  cache[""] = INITIAL;
};

const hiddenKozaneWithLimit = (model: { limit: number }) => {
  const hidden = document.createElement("div");
  const inner = document.createElement("div");
  hidden.appendChild(inner);

  Object.defineProperty(hidden, "scrollHeight", {
    get() {
      const fontSize = Number.parseFloat(hidden.style.fontSize);
      return fontSize > model.limit ? 101 : 100;
    },
  });

  return hidden;
};

describe("adjustFontSize", () => {
  beforeEach(() => {
    resetCache();
  });

  test("finds the largest font size that fits the hidden kozane", () => {
    const hidden = hiddenKozaneWithLimit({ limit: 42 });
    const fontSize = adjustFontSize("long text", hidden);

    expect(fontSize).toBeGreaterThan(41);
    expect(fontSize).toBeLessThanOrEqual(42);
  });

  test("reuses the cached size for the same text", () => {
    const model = { limit: 32 };
    const hidden = hiddenKozaneWithLimit(model);
    const first = adjustFontSize("cached text", hidden);

    model.limit = 96;

    expect(adjustFontSize("cached text", hidden)).toBe(first);
  });

  test("returns zero when text cannot fit even at the smallest searched size", () => {
    const hidden = hiddenKozaneWithLimit({ limit: 0 });

    expect(adjustFontSize("too long", hidden)).toBe(0);
  });
});
