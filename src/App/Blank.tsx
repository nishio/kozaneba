import { useEffect, useGlobal } from "reactn";
import { MyAppBar } from "../AppBar/MyAppBar";
import { AdjustFontSize } from "../Kozane/AdjustFontSize";
import { ItemCanvas } from "../Canvas/ItemCanvas";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";
import { Menus } from "../Menu/Menus";
import { MenuAnchor } from "../utils/show_menu";
import { Dialogs } from "../Dialog/Dialogs";
import { KeyboardShortcut } from "./KeyboardShortcut";
import { LocalChangeWatcher } from "./LocalChangeWatcher";
import { StatusBar } from "./StatusBar";
import { onPaste } from "./onPaste";
import { dev_log } from "../utils/dev";
import { Alert, Snackbar } from "@mui/material";
import { updateGlobal } from "../Global/updateGlobal";

export const Blank = () => {
  const [cloud_ba] = useGlobal("cloud_ba");
  dev_log("render Blank", cloud_ba);

  useEffect(() => {
    if (cloud_ba !== "") {
      return set_up_read_subscription(cloud_ba);
    }
  }, [cloud_ba]);

  return (
    <div className="App" onPaste={onPaste}>
      <MyAppBar />
      <ItemCanvas />
      <AdjustFontSize />
      <MenuAnchor />
      <StatusBar />
      <LocalChangeWatcher />
      <KeyboardShortcut />
      <Dialogs />
      <Menus />
      <OverCapacityAlert />
    </div>
  );
};

const OverCapacityAlert = () => {
  const [itemStore] = useGlobal("itemStore");
  const [did_warn_over_capacity] = useGlobal("did_warn_over_capacity");
  const num = Object.keys(itemStore).length;
  if (num > 2000) {
    return (
      <Snackbar open={true}>
        <Alert variant="filled" severity="error">
          Objects on the Ba is over 2000. The Ba will not be saved.
        </Alert>
      </Snackbar>
    );
  }
  if (num > 1000) {
    const onClose = () => {
      updateGlobal((g) => {
        g.did_warn_over_capacity = true;
      });
    };
    return (
      <Snackbar open={!did_warn_over_capacity}>
        <Alert variant="filled" severity="info" onClose={onClose}>
          Objects on the Ba is over 1000. If it is over 2000, the Ba will not be
          saved.
        </Alert>
      </Snackbar>
    );
  }
  return null;
};
