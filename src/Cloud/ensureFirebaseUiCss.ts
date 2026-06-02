const FIREBASE_UI_CSS_URL =
  "https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css";

let did_request_firebase_ui_css = false;

export const ensureFirebaseUiCss = () => {
  if (
    did_request_firebase_ui_css ||
    document.querySelector('link[data-kozaneba-firebaseui-css="true"]')
  ) {
    return;
  }

  did_request_firebase_ui_css = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FIREBASE_UI_CSS_URL;
  link.dataset.kozanebaFirebaseuiCss = "true";
  document.head.appendChild(link);
};
