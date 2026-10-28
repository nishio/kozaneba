import { TWorldCoord } from "./world_to_screen";
import {
  screen_to_world_with_viewport,
  TScreenCoord,
  TViewportTransform,
} from "./world_to_screen";
import { zoom_around_world_point } from "./zoom_around_world_point";

const screen = (x: number, y: number) => [x, y] as TScreenCoord;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const applyZoom = (
  viewport: TViewportTransform,
  zoomCenter: TWorldCoord,
  scale: number
): TViewportTransform => {
  const [nextScale, nextCenter] = zoom_around_world_point(
    viewport.scale,
    world(-viewport.trans_x, -viewport.trans_y),
    zoomCenter,
    scale
  );
  return {
    ...viewport,
    scale: nextScale,
    trans_x: -nextCenter[0],
    trans_y: -nextCenter[1],
  };
};

describe("zoom_around_world_point", () => {
  test("keeps the world point under the cursor stable", () => {
    const viewport = {
      width: 800,
      height: 600,
      scale: 1,
      trans_x: 100,
      trans_y: 50,
    };
    const cursor = screen(300, 200);
    const before = screen_to_world_with_viewport(cursor, viewport);

    const nextViewport = applyZoom(viewport, before, 2);
    const after = screen_to_world_with_viewport(cursor, nextViewport);

    expect(after[0]).toBeCloseTo(before[0]);
    expect(after[1]).toBeCloseTo(before[1]);
  });

  test("keeps the cursor world point stable when zooming out", () => {
    const viewport = {
      width: 1024,
      height: 768,
      scale: 2,
      trans_x: -30,
      trans_y: 90,
    };
    const cursor = screen(700, 500);
    const before = screen_to_world_with_viewport(cursor, viewport);

    const nextViewport = applyZoom(viewport, before, 0.5);
    const after = screen_to_world_with_viewport(cursor, nextViewport);

    expect(nextViewport.scale).toBeCloseTo(1);
    expect(after[0]).toBeCloseTo(before[0]);
    expect(after[1]).toBeCloseTo(before[1]);
  });

  test("keeps the cursor world point stable across a zoom in/out sequence", () => {
    let viewport = {
      width: 375,
      height: 667,
      scale: 1,
      trans_x: 12,
      trans_y: -34,
    };
    const cursor = screen(123, 456);
    const before = screen_to_world_with_viewport(cursor, viewport);

    // The pinch target stays under the same screen point at every step.
    for (const factor of [1.25, 1.25, 0.8, 1.6, 0.5]) {
      const pivot = screen_to_world_with_viewport(cursor, viewport);
      viewport = applyZoom(viewport, pivot, factor);
      const after = screen_to_world_with_viewport(cursor, viewport);
      expect(after[0]).toBeCloseTo(before[0]);
      expect(after[1]).toBeCloseTo(before[1]);
    }

    // 1.25 * 1.25 * 0.8 * 1.6 * 0.5 == 1
    expect(viewport.scale).toBeCloseTo(1);
  });
});
