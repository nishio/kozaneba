// FirebaseUI sign-in flow. On desktop a popup is nicer (keeps the app loaded),
// but on iPad / touch Safari popups are frequently blocked or awkward, so a
// full-page redirect is more reliable. See QUEUE K17 /
// wiki/themes/iPad実機対応調査_2026-06.md (Google sign-in は popup 固定だった).
//
// NOTE: redirect flow requires the deploy origin to be in Firebase Auth's
// authorized domains / OAuth redirect URIs (Firebase console = human).
export type TSignInFlow = "popup" | "redirect";

export const sign_in_flow_for = (env: {
  coarsePointer: boolean;
  hasTouch: boolean;
}): TSignInFlow => (env.coarsePointer || env.hasTouch ? "redirect" : "popup");

export const preferred_sign_in_flow = (): TSignInFlow => {
  if (typeof window === "undefined") return "popup";
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const hasTouch = "ontouchstart" in window;
  return sign_in_flow_for({ coarsePointer, hasTouch });
};
