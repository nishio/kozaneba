# Touch recordings

Sessions recorded on a real device. `npm run test:replay` replays each
`*.json` here and requires the board after every gesture to match what was
recorded.

To make one (iPad):

1. Open `https://kozaneba.netlify.app/#blank&record=sample`. It shows a
   sample board and a small "● REC" panel at the bottom left. Nothing is
   saved to the cloud.
2. Use the board as usual: drag, drop into groups, open/close, pinch,
   tap for menus, double-tap a line.
3. Tap "Save" in the panel and save the file (Files, AirDrop).
4. Put the file here and commit it.

Recordings carry pointer positions, timings and board layout. Kozane text
is replaced by `x` of the same length.

Taps are replayed by position, so a recording only matches the layout it was
made on. A change that moves things on screen (for example #110, which made
the menu items 44px tall on touch) can make an old recording tap a different
menu item. `replay.spec.ts` then has to put the old layout back for that file
(see `MENU_ITEMS_36PX`) until the session is recorded again on a device.
