import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
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
import { MenuAnchor, show_menu } from "./show_menu";

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
          <MainMenu />
          <Typography variant="h6">
            {/* className={classes.title} */}
            Movable Ideas
          </Typography>
          <DevMenu />
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
      <FusenMenu />
      <MenuAnchor />
    </div>
  );
}

const FusenMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Fusen";
  const onClose = () => {
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem>Fusen Menu 1</MenuItem>
      <MenuItem>Fusen Menu 2</MenuItem>
      <MenuItem>Fusen Menu 3</MenuItem>
    </Menu>
  );
};
const DevMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Dev";
  const onClose = () => {
    setMenu("");
  };
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    show_menu("Dev", event);
  };
  const onHello = () => {
    alert("Hello!");
  };
  return (
    <>
      <Button color="inherit" onClick={onButtonClick}>
        DEV
      </Button>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <MenuItem onClick={onHello}>Hello 1</MenuItem>
        <MenuItem onClick={onHello}>Hello 2</MenuItem>
        <MenuItem onClick={onHello}>Hello 3</MenuItem>
      </Menu>
    </>
  );
};

const MainMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Main";
  const onClose = () => {
    setMenu("");
  };
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    show_menu("Main", event);
  };
  const onHello = () => {
    alert("Hello!");
  };
  return (
    <>
      <IconButton
        edge="start"
        // className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={onButtonClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <MenuItem onClick={onHello}>Main</MenuItem>
        <MenuItem onClick={onHello}>Hello 2</MenuItem>
        <MenuItem onClick={onHello}>Hello 3</MenuItem>
      </Menu>
    </>
  );
};

export default App;
