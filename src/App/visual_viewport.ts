// Keeps a CSS custom property `--app-height` in sync with the *visible* viewport
// height. On iPad Safari the software keyboard overlays the layout viewport
// (height:100% does not shrink), which pushes editing UI under the keyboard and
// lets the page scroll/jump. Driving the app container height from
// window.visualViewport makes the app fit the visible area instead. On desktop
// visualViewport.height === innerHeight, so this is a no-op. See QUEUE K14.
export const install_visual_viewport_height = (): (() => void) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }
  const root = document.documentElement;
  const apply = () => {
    const h = window.visualViewport?.height ?? window.innerHeight;
    if (h > 0) root.style.setProperty("--app-height", `${Math.round(h)}px`);
  };
  apply();

  const vv = window.visualViewport;
  vv?.addEventListener("resize", apply);
  vv?.addEventListener("scroll", apply);
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);

  return () => {
    vv?.removeEventListener("resize", apply);
    vv?.removeEventListener("scroll", apply);
    window.removeEventListener("resize", apply);
    window.removeEventListener("orientationchange", apply);
  };
};
