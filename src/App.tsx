import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useEffect } from "react";
import { useGlobal } from "reactn";
import { AddFusenDialog } from "./AddFusenDialog";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import { onWheel } from "./onWheel";
import { MenuAnchor } from "./show_menu";
import { MainMenu } from "./MainMenu";
import { DevMenu } from "./DevMenu";
import { FusenMenu } from "./FusenMenu";
import { onDrop, allowDrop } from "./dragdrop";

function App() {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  // console.log("render");
  useEffect(() => {
    // console.log("useEffect");
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
          <MainMenu />
          <Typography variant="h6">
            {/* className={classes.title} */}
            Movable Ideas
          </Typography>
          <DevMenu />
        </Toolbar>
      </AppBar>

      <div id="canvas" onDrop={onDrop} onDragOver={allowDrop}>
        <Center>
          {fusens.map((fusen) => (
            <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
          ))}
          {idsToDom(drawOrder, offset)}
        </Center>
      </div>
      <AdjustFontSize />
      <AddFusenDialog />
      <FusenMenu />
      <MenuAnchor />
    </div>
  );
}

export default App;
