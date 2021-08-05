import { useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import styled from "styled-components";

const H = styled.h2`
  margin-top: 0;
`;
const tutorial_pages = [
  <div>
    <H>Welcome to Kozaneba!</H>
    <p>You are currently in the tutorial mode.</p>
    <p>If you do not need tutorial, you can close this dialog now.</p>
    <p>Please click `Next` button...</p>
  </div>,
  <div>
    <H>Kozaneba is a tool to organize your thought</H>
    <p>To organize your thought, </p>
    <p>Kozane(小札, small plate)</p>
    <p>If you do not need tutorial, you can close this dialog now.</p>
    <p>Please click `Next` button...</p>
  </div>,
  <div>
    <p>
      You can open this <b>tutorial dialog</b> by clicking the icon on
      right-bottom <b>status bar</b>.
    </p>
    <img src="/open_tutorial.png" alt="" />
  </div>,
];
export const TutorialDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [p, setPage] = useGlobal("tutorial_page");
  const open = dialog === "Tutorial";
  const onClose = () => {
    close_menu_and_dialog();
  };

  const page = tutorial_pages[p];

  const Prev =
    p > 0 ? (
      <Button
        color="primary"
        onClick={() => {
          setPage(p - 1);
        }}
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
      >
        Next
      </Button>
    ) : null;

  return (
    <Dialog open={open} onClose={onClose} data-testid="tutorial-dialog">
      <DialogTitle id="form-dialog-title">
        Tutorial ({p + 1} / {tutorial_pages.length})
      </DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        {/* <DialogContentText>Tutorial</DialogContentText> */}
        {page}
      </DialogContent>
      <DialogActions>
        {Prev}
        {Next}
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
