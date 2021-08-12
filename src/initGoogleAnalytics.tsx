export const initGoogleAnalytics = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (a: string, b: unknown, c?: unknown) => {
    window.dataLayer.push(a, b, c);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-8KW8XY012C");
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      a: string,
      b: unknown,
      c?: { event_category?: string; event_label?: string; value?: number }
    ) => unknown;
  }
}
