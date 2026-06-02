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
});
