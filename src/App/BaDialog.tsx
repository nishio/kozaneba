import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
} from "@material-ui/core";
import { setGlobal, useGlobal } from "reactn";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { mark_local_changed } from "../Cloud/mark_local_changed";

export type Ba = { title: string; id: string; last_updated: number };

export const BaDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [anyone_writable] = useGlobal("anyone_writable");
  const open = dialog === "Ba";
  const mode = anyone_writable ? "edit" : "view";

  const onClose = () => {
    close_menu_and_dialog();
  };

  const onChange = (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const value = e.target.value;
    const anyone_writable = value === "edit";
    console.log(value, anyone_writable);
    setGlobal({ anyone_writable });
    mark_local_changed();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="ba-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">Ba</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <Title />
        <p>
          Anyone with the link can{" "}
          <Select value={mode} onChange={onChange}>
            <MenuItem value="edit">edit</MenuItem>
            <MenuItem value="view">view</MenuItem>
          </Select>
        </p>
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
    const x = prompt(`Current Title: ${title}\nNew Title:`);
    if (x !== null) {
      setTitle(x);
      mark_local_changed();
    }
  };
  return (
    <p>
      Title: {title} <button onClick={onClick}>change</button>
    </p>
  );
};
