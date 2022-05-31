import { getGlobal, setGlobal, useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { close_menu_and_dialog } from "../../utils/close_menu";
import { tutorial_pages } from "./tutorial_pages";
import { useEffect } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faLanguage } from "@fortawesome/free-solid-svg-icons";

export const TutorialDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [p, setPage] = useGlobal("tutorial_page");
  const [lang] = useGlobal("language");

  const open = dialog === "Tutorial";
  const onClose = () => {
    if (getGlobal().in_tutorial === false) {
      setGlobal({ tutorial_page: 0 }); // GO to TOC
    }
    close_menu_and_dialog();
  };
  useEffect(() => {
    console.log(`Tutorial Page: ${p} open: ${open}`);
  }, [p, open]);

  let page = tutorial_pages[p]!;
  if (page.translate && page.translate[lang]) {
    page = page.translate[lang]!;
  }
  // const page = tutorial_pages[p]!.translate[lang] ?? tutorial_pages[p];
  useEffect(() => {
    if (open && page?.title === "Tutorial Finished🎉") {
      setGlobal({ in_tutorial: false });
      window.gtag("event", "tutorial_finished");
    }
  }, [page, open]);

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
          window.gtag("event", `tutorial_next_${p}`);
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
      <DialogTitle id="form-dialog-title" data-testid="tutorial-title">
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
        {/* <FontAwesomeIcon icon={faLanguage} /> */}
        {Prev}
        {Next}
        <Button color="primary" onClick={onClose} data-testid="tutorial-close">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
