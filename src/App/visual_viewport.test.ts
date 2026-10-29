import { install_visual_viewport_height } from "./visual_viewport";

const app_height = () =>
  document.documentElement.style.getPropertyValue("--app-height");

const set_visual_viewport = (height: number | undefined) => {
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: height === undefined ? undefined : Object.assign(new EventTarget(), { height }),
  });
};

let uninstall = () => {};
afterEach(() => {
  uninstall();
  set_visual_viewport(undefined);
  document.documentElement.style.removeProperty("--app-height");
});

test("no keyboard: .App keeps height:100% (no variable to go stale on resize)", () => {
  set_visual_viewport(window.innerHeight);
  uninstall = install_visual_viewport_height();
  expect(app_height()).toBe("");
});

test("keyboard up: the app fits the visible area, and goes back when it hides", () => {
  set_visual_viewport(window.innerHeight);
  uninstall = install_visual_viewport_height();
  set_visual_viewport(300); // keyboard shown
  window.dispatchEvent(new Event("resize"));
  expect(app_height()).toBe("300px");
  set_visual_viewport(window.innerHeight); // keyboard hidden
  window.dispatchEvent(new Event("resize"));
  expect(app_height()).toBe("");
});
