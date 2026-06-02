import {
  screen_to_world_with_viewport,
  TScreenCoord,
  TViewportTransform,
  TWorldCoord,
  world_to_screen_with_viewport,
} from "./world_to_screen";

const screen = (x: number, y: number) => [x, y] as TScreenCoord;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const expectWorldCloseTo = (actual: TWorldCoord, expected: TWorldCoord) => {
  expect(actual[0]).toBeCloseTo(expected[0]);
  expect(actual[1]).toBeCloseTo(expected[1]);
};

const expectScreenCloseTo = (actual: TScreenCoord, expected: TScreenCoord) => {
  expect(actual[0]).toBeCloseTo(expected[0]);
  expect(actual[1]).toBeCloseTo(expected[1]);
};

describe("screen/world coordinate conversion", () => {
  const viewports: TViewportTransform[] = [
    { width: 800, height: 600, scale: 1, trans_x: 0, trans_y: 0 },
    { width: 1024, height: 768, scale: 2, trans_x: 100, trans_y: -50 },
    { width: 375, height: 667, scale: 0.5, trans_x: -200, trans_y: 300 },
  ];

  const worldPoints = [
    world(0, 0),
    world(120, -80),
    world(-1000.25, 500.5),
  ];

  test("world_to_screen and screen_to_world are inverse transforms", () => {
    viewports.forEach((viewport) => {
      worldPoints.forEach((point) => {
        const screenPoint = world_to_screen_with_viewport(point, viewport);
        expectWorldCloseTo(
          screen_to_world_with_viewport(screenPoint, viewport),
          point
        );
      });
    });
  });

  test("applies viewport center, translation, and scale", () => {
    const viewport = {
      width: 800,
      height: 600,
      scale: 2,
      trans_x: 10,
      trans_y: -20,
    };

    expectScreenCloseTo(
      world_to_screen_with_viewport(world(5, 30), viewport),
      screen(430, 320)
    );
  });
});
