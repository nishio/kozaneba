import { setGlobal, useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { close_menu_and_dialog } from "../../AppBar/close_menu";
import { tutorial_pages } from "./tutorial_pages";
import { useEffect } from "react";

export const TutorialDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [p, setPage] = useGlobal("tutorial_page");
  const open = dialog === "Tutorial";
  const onClose = () => {
    close_menu_and_dialog();
  };
  useEffect(() => {
    console.log(`Tutorial Page: ${p} open: ${open}`);
  }, [p, open]);

  const page = tutorial_pages[p];
  if (page?.title === "Tutorial Finished🎉") {
    setGlobal({ in_tutorial: false });
    window.gtag("event", "tutorial_finished");
  }
  const Prev =
    p > 0 ? (
      <Button
        color="primary"
        onClick={() => {
          setPage(p - 1);
        }}
        data-testid="tutorial-previous"
      >
        Previous
      </Button>
    ) : null;

  const Next =
    p < tutorial_pages.length - 1 ? (
      <Button
        color="primary"
        onClick={() => {
          setPage(p + 1);
        }}
        data-testid="tutorial-next"
      >
        Next
      </Button>
    ) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="body"
      data-testid="tutorial-dialog"
    >
      <DialogTitle id="form-dialog-title">
        {/* Tutorial ({p + 1} / {tutorial_pages.length}) */}
        {page?.title}
      </DialogTitle>
      <DialogContent
        style={{
          padding: "0px 24px",
          overflow: "scroll",
        }}
      >
        {/* <DialogContentText>Tutorial</DialogContentText> */}

        {page?.body}
        {/* <hr /> */}
      </DialogContent>
      <DialogActions>
        {Prev}
        {Next}
        <Button color="primary" onClick={onClose} data-testid="tutorial-close">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
