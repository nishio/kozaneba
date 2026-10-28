/// <reference types="cypress" />

// Real (trusted) mouse input through the Chrome DevTools Protocol.
//
// `cy.trigger()` / `.dblclick()` / `.rightclick()` dispatch synthetic events
// on the element you name, so they skip hit testing and pointer capture.
// Bugs where the browser delivers the event to a different element (e.g. the
// canvas capturing the pointer) do not show up with them. These helpers press
// the mouse at a screen point instead, the way a user does, so the browser
// decides which element gets each event. Chromium-based browsers only
// (Electron, Chrome); this is what cypress-real-events does, without the
// dependency.

type TButton = "left" | "right";

const BUTTONS_MASK: Record<TButton, number> = { left: 1, right: 2 };

const send = (command: string, params: Record<string, unknown>) =>
  Cypress.automation("remote:debugger:protocol", { command, params });

// Convert a point in the app (AUT iframe) viewport to the top-level viewport
// that CDP uses: the runner shows the app in a scaled iframe.
const to_top_level = (x: number, y: number): [number, number] => {
  const top = window.top;
  const frame = top?.document.querySelector<HTMLIFrameElement>(
    "iframe.aut-iframe"
  );
  if (!frame) return [x, y];
  const rect = frame.getBoundingClientRect();
  const scale = frame.offsetWidth === 0 ? 1 : rect.width / frame.offsetWidth;
  return [rect.x + x * scale, rect.y + y * scale];
};

type TMouseEvent = {
  type: "mouseMoved" | "mousePressed" | "mouseReleased";
  x: number;
  y: number;
  button: TButton | "none";
  buttons: number;
  clickCount?: number;
};

// Send the events one after another, waiting for each to be dispatched.
const dispatch = (events: TMouseEvent[]) =>
  cy.then(() =>
    cy.wrap(
      events.reduce<PromiseLike<unknown>>(
        (prev, e) =>
          prev.then(() =>
            send("Input.dispatchMouseEvent", {
              clickCount: 0,
              ...e,
              pointerType: "mouse",
            })
          ),
        Cypress.Promise.resolve()
      ),
      { log: false }
    )
  );

// A point in the app viewport (client coordinates of the app window).
export type TAppPoint = [number, number];

export const real_click_at = (
  point: TAppPoint,
  {
    button = "left",
    clickCount = 1,
  }: { button?: TButton; clickCount?: number } = {}
) =>
  cy.then(() => {
    const [x, y] = to_top_level(point[0], point[1]);
    const events: TMouseEvent[] = [
      { type: "mouseMoved", x, y, button: "none", buttons: 0 },
    ];
    for (let i = 1; i <= clickCount; i++) {
      events.push(
        { type: "mousePressed", x, y, button, buttons: BUTTONS_MASK[button], clickCount: i },
        { type: "mouseReleased", x, y, button, buttons: 0, clickCount: i }
      );
    }
    dispatch(events);
  });

export const real_dblclick_at = (point: TAppPoint) =>
  real_click_at(point, { clickCount: 2 });

export const real_rightclick_at = (point: TAppPoint) =>
  real_click_at(point, { button: "right" });

// Press the left button at `from`, move in `steps` to `to`, release.
export const real_drag = (from: TAppPoint, to: TAppPoint, steps = 5) =>
  cy.then(() => {
    const [x0, y0] = to_top_level(from[0], from[1]);
    const [x1, y1] = to_top_level(to[0], to[1]);
    const events: TMouseEvent[] = [
      { type: "mouseMoved", x: x0, y: y0, button: "none", buttons: 0 },
      { type: "mousePressed", x: x0, y: y0, button: "left", buttons: 1, clickCount: 1 },
    ];
    for (let i = 1; i <= steps; i++) {
      events.push({
        type: "mouseMoved",
        x: x0 + ((x1 - x0) * i) / steps,
        y: y0 + ((y1 - y0) * i) / steps,
        button: "left",
        buttons: 1,
      });
    }
    events.push({ type: "mouseReleased", x: x1, y: y1, button: "left", buttons: 0, clickCount: 1 });
    dispatch(events);
  });

// The center of an element's bounding box, in app viewport coordinates.
// Accepts what `cy.testid(...).then(($el) => ...)` passes (a jQuery object,
// typed as Element by the custom command).
export const center_of = (subject: Element | JQuery<Element>): TAppPoint => {
  // Not `instanceof Element`: the element belongs to the app's window.
  const el =
    "getBoundingClientRect" in subject ? subject : (subject[0] as Element);
  const rect = el.getBoundingClientRect();
  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
};
