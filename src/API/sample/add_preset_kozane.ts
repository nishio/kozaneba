import { kozaneba } from "../KozanebaAPI";

kozaneba.user_menus.Main!.push({
  label: "↔",
  onClick: () => kozaneba.add_kozane("↔"),
});
kozaneba.user_menus.Main!.push({
  label: "↕",
  onClick: () => kozaneba.add_kozane("↕"),
});
kozaneba.user_menus.Main!.push({
  label: "🤔",
  onClick: () => kozaneba.add_kozane("🤔"),
});
