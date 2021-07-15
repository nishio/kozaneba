import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextareaAutosize,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import { onWheel } from "./onWheel";

function App() {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);
  const offset = { x: 0, y: 0 };
  return (
    <div className="App">
      <div id="canvas">
        <Center>
          {fusens.map((fusen) => (
            <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
          ))}
          {idsToDom(drawOrder, offset)}
        </Center>
      </div>
      <AdjustFontSize />
      <AddFusenDialog />
    </div>
  );
}

const AddFusenDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "AddFusen";
  const onClose = () => {
    setDialog("");
  };

  return (
    <Dialog open={open} fullWidth={true} fullScreen={true} onClose={onClose}>
      <DialogTitle id="form-dialog-title">Add Fusens</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        {/* <DialogContentText>...</DialogContentText> */}
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}>
            <TextareaAutosize
              autoFocus
              id="multiline"
              style={{ width: "calc(100% - 10px)" }}
              rowsMin={40}
              // onChange={onChange}
              // defaultValue={initialText}
            ></TextareaAutosize>
          </div>
          <div style={{ maxWidth: "20%" }}>
            <div
              style={{
                position: "sticky",
                top: "0px",
                background: "#eee",
                padding: "2px",
              }}
            >
              Menu
              <hr />
              New Pieces:
              <hr />
              <hr />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
        <Button color="primary">Import</Button>
      </DialogActions>
    </Dialog>
  );
};
export default App;
