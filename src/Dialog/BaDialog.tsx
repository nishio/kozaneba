import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useState } from "react";
import { setGlobal, useGlobal } from "reactn";
import { close_menu_and_dialog } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";
import { delete_ba } from "../Cloud/delete_ba";
import { can_write, is_cloud } from "../utils/can_write";
import { make_copy } from "../utils/make_copy";

export type Ba = { title: string; id: string; last_updated: number };

export const BaDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [anyone_writable] = useGlobal("anyone_writable");
  const open = dialog === "Ba";
  const mode = anyone_writable ? "edit" : "view";

  const onClose = () => {
    close_menu_and_dialog();
  };

  const can_delete = false; // temporary toggle: is_cloud() && can_write()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="ba-dialog"
      keepMounted={false}
      maxWidth="lg"
    >
      <DialogTitle id="form-dialog-title">Ba</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <Title />
        <Share mode={mode} />
        <Scrapbox />

        <div>
          <MakeCopy />

          <Button
            color="primary"
            onClick={delete_ba}
            style={{
              border: "1px solid",
              visibility: can_delete ? "visible" : "hidden",
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Title = () => {
  const [title, setTitle] = useGlobal("title");
  const onClick = () => {
    const x = prompt(`Current Title: ${title}\nNew Title:`, title);
    if (x !== null) {
      setTitle(x);
      mark_local_changed();
    }
  };
  const button = can_write() ? <button onClick={onClick}>change</button> : null;
  return (
    <p>
      Title: {title} {button}
    </p>
  );
};

const Scrapbox = () => {
  const [scrapbox, setScarpbox] = useGlobal("scrapbox");
  const onClick = () => {
    const x = prompt(`Enter scrapbox project:`, scrapbox);
    if (x !== null) {
      setScarpbox(x);
      mark_local_changed();
    }
  };
  const button = can_write() ? <button onClick={onClick}>change</button> : null;
  return (
    <p>
      Scarpbox Project(Experimental): {scrapbox} {button}
    </p>
  );
};

const Share: React.FC<{ mode: string }> = ({ mode }) => {
  const [copy_done, set_copy_done] = useState("");
  const [cloud_ba] = useGlobal("cloud_ba");
  if (!can_write()) return null;
  if (cloud_ba === "") {
    return <span>Not saved yet</span>;
  }

  const share_url = `https://kozaneba.netlify.app/#${mode}=${cloud_ba}`;
  const onChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    console.log(e);
    const anyone_writable = value === "edit";
    console.log(anyone_writable);
    setGlobal({ anyone_writable });
    mark_local_changed();
  };

  const onCopy = () => {
    navigator.clipboard
      .writeText(share_url)
      .then(() => {
        set_copy_done(" OK");
      })
      .catch(() => {
        set_copy_done(" ERROR");
      });
  };

  return (
    <div>
      <div>
        URL: <button onClick={onCopy}>copy{copy_done}</button>
        <input
          type="text"
          value={share_url}
          style={{ width: "30em" }}
          readOnly
        />
      </div>
      <div>
        Anyone with the link can{" "}
        <Select value={mode} onChange={onChange}>
          <MenuItem value="edit">edit</MenuItem>
          <MenuItem value="view">view</MenuItem>
        </Select>
      </div>
    </div>
  );
};

const MakeCopy = () => {
  return (
    <Button
      color="primary"
      onClick={make_copy}
      style={{
        border: "1px solid",
        visibility: is_cloud() ? "visible" : "hidden",
      }}
    >
      Make Copy
    </Button>
  );
};
