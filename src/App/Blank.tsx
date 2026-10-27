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
import { Alert, Button, Snackbar } from "@mui/material";
import { updateGlobal } from "../Global/updateGlobal";
import { make_copy } from "../utils/make_copy";

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
      <SaveErrorAlert />
      <SaveConflictAlert />
    </div>
  );
};

const SaveErrorAlert = () => {
  const [save_error] = useGlobal("save_error");
  if (save_error === "") return null;
  const onClose = () => {
    updateGlobal((g) => {
      g.save_error = "";
    });
  };
  return (
    <Snackbar open={true}>
      <Alert variant="filled" severity="error" onClose={onClose}>
        {save_error}
      </Alert>
    </Snackbar>
  );
};

// save() stopped because another device / tab saved this Ba in between
// (optimistic lock, D3). This tab's state is kept in the local backup.
const SaveConflictAlert = () => {
  const [save_conflict] = useGlobal("save_conflict");
  const [cloud_ba] = useGlobal("cloud_ba");
  const [language] = useGlobal("language");
  if (save_conflict === "" || save_conflict !== cloud_ba) return null;
  const ja = language.startsWith("ja");
  const onReload = () => {
    window.location.reload();
  };
  return (
    <Snackbar open={true} data-testid="save-conflict">
      <Alert
        variant="filled"
        severity="warning"
        action={
          <>
            <Button color="inherit" size="small" onClick={onReload}>
              {ja ? "再読み込み" : "Reload"}
            </Button>
            <Button color="inherit" size="small" onClick={make_copy}>
              {ja ? "こちらを別の場として保存" : "Save this as a new Ba"}
            </Button>
          </>
        }
      >
        {ja
          ? "別の端末かタブでこの場が更新されています。上書きしないよう、こちらの変更は保存していません（この端末のバックアップには残しています）。再読み込みすると向こうの版を開きます。"
          : "This Ba was updated on another device or tab. To avoid overwriting it, the changes here are not saved (a copy is kept in this device's backup). Reload opens the other version."}
      </Alert>
    </Snackbar>
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
