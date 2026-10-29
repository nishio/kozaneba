// Keeps a CSS custom property `--app-height` in sync with the *visible* viewport
// height. On iPad Safari the software keyboard overlays the layout viewport
// (height:100% does not shrink), which pushes editing UI under the keyboard and
// lets the page scroll/jump. Driving the app container height from
// window.visualViewport makes the app fit the visible area instead. See QUEUE K14.
export const install_visual_viewport_height = (): (() => void) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }
  const root = document.documentElement;
  // Only while the visible area is smaller than the layout viewport (the
  // keyboard is up). Otherwise leave .App at height:100%: a value kept in sync
  // from resize events lags behind a window resize, and while it is stale the
  // app is taller than the window, the page gets a scrollbar and the canvas
  // center moves (Cypress drags landed 8 px / 80 px off after cy.viewport).
  const apply = () => {
    const h = window.visualViewport?.height;
    if (h !== undefined && h > 0 && h < window.innerHeight - 1) {
      root.style.setProperty("--app-height", `${Math.round(h)}px`);
    } else {
      root.style.removeProperty("--app-height");
    }
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
