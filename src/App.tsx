import {
  AppBar,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import { AddFusenDialog } from "./AddFusenDialog";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import { onWheel } from "./onWheel";
import MenuIcon from "@material-ui/icons/Menu";

function App() {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);
  const offset = { x: 0, y: 0 };
  const APP_BAR_BGCOLOR = "#000080"; // original "3f51b5";
  return (
    <div className="App">
      <AppBar
        position="absolute"
        style={{ opacity: "50%", backgroundColor: APP_BAR_BGCOLOR }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            // className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            {/* className={classes.title} */}
            Movable Ideas
          </Typography>
          <Button color="inherit">DEV</Button>
        </Toolbar>
      </AppBar>

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

export default App;
