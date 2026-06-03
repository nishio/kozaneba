import { importRegroupJSON } from "./importRegroupJSON";

describe("importRegroupJSON", () => {
  test("normalizes child positions relative to their root group", () => {
    const json: Parameters<typeof importRegroupJSON>[0] = {
      drawOrder: ["G"],
      itemStore: {
        G: {
          type: "group",
          position: [100, 50],
          items: ["A", "B"],
        },
        A: {
          type: "piece",
          position: [120, 70],
        },
        B: {
          type: "piece",
          position: [80, 40],
        },
      },
    };

    const imported = importRegroupJSON(json);

    expect(imported.itemStore.A?.position).toEqual([20, 20]);
    expect(imported.itemStore.B?.position).toEqual([-20, -10]);
    expect(imported.itemStore.G?.position).toEqual([100, 50]);
  });

  test("keeps nested children relative to their direct parent", () => {
    const json: Parameters<typeof importRegroupJSON>[0] = {
      drawOrder: ["A"],
      itemStore: {
        A: {
          type: "group",
          position: [100, 50],
          items: ["B"],
        },
        B: {
          type: "group",
          position: [130, 70],
          items: ["C"],
        },
        C: {
          type: "piece",
          position: [135, 75],
        },
      },
    };

    const imported = importRegroupJSON(json);

    expect(imported.itemStore.B?.position).toEqual([30, 20]);
    expect(imported.itemStore.C?.position).toEqual([5, 5]);
  });
});
