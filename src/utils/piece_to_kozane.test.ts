import { piece_to_kozane, title_to_text, upgrade } from "./piece_to_kozane";

describe("piece_to_kozane", () => {
  test("upgrades legacy piece items to kozane items", () => {
    const itemStore = {
      a: { type: "piece", text: "A" },
      b: { type: "kozane", text: "B" },
    };

    expect(piece_to_kozane(itemStore)).toEqual({
      a: { type: "kozane", text: "A" },
      b: { type: "kozane", text: "B" },
    });
  });
});

describe("title_to_text", () => {
  test("uses legacy group title when text is missing", () => {
    const itemStore = {
      g: { type: "group", title: "Group title" },
      h: { type: "group", text: "Existing text", title: "Ignored" },
    };

    expect(title_to_text(itemStore)).toEqual({
      g: { type: "group", title: "Group title", text: "Group title" },
      h: { type: "group", text: "Existing text", title: "Ignored" },
    });
  });
});

describe("upgrade", () => {
  test("applies piece and title upgrades together", () => {
    const itemStore = {
      a: { type: "piece", text: "A" },
      g: { type: "group", title: "G" },
    };

    expect(upgrade(itemStore)).toEqual({
      a: { type: "kozane", text: "A" },
      g: { type: "group", title: "G", text: "G" },
    });
  });
});
