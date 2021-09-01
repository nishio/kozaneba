// you do not need to put this import in UserScript
import { kozaneba } from "./KozanebaAPI";

kozaneba.after_render_toppage = () => {
  kozaneba.show_dialog("User");
};

kozaneba.user_buttons.push({
  label: "Add",
  onClick: () => {
    kozaneba.show_dialog("AddKozane");
  },
});

kozaneba.constants.group_padding = 5;

const copy_title = {
  label: "copy title",
  onClick: () => {
    const item = kozaneba.get_clicked_item();
    if (item !== undefined) {
      navigator.clipboard.writeText(item.text);
    }
  },
};
kozaneba.user_menus.Scrapbox.push(copy_title);

const fit_to_selection = {
  label: "fit to",
  onClick: () => {
    kozaneba.fit_to_contents(kozaneba.get_selected_ids());
    kozaneba.reset_selection();
  },
};
kozaneba.user_menus.Selection.push(fit_to_selection);

const make_transparent = {
  label: "make transparent",
  onClick: () => {
    const g = kozaneba.get_global();
    console.log("onClick", g.clicked_target);
    if (g.clicked_target === "") return;
    kozaneba.update_style(g.clicked_target, (style) => {
      style.mixBlendMode = "multiply";
      style.border = "none";
      return style;
    });
    kozaneba.redraw();
  },
};
kozaneba.user_menus.Gyazo.push(make_transparent);

kozaneba.user_menus.Main.push({
  label: "↔",
  onClick: () => kozaneba.add_kozane("↔"),
});
kozaneba.user_menus.Main.push({
  label: "↕",
  onClick: () => kozaneba.add_kozane("↕"),
});
kozaneba.user_menus.Main.push({
  label: "🤔",
  onClick: () => kozaneba.add_kozane("🤔"),
});
