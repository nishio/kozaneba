import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { MainMenu } from "./MainMenu/MainMenu";
import { DevMenu } from "./DevMenu";
import { UserButtons } from "./UserButtons";
import { dev_log } from "../utils/dev";

export const MyAppBar = () => {
  const APP_BAR_BGCOLOR = "#000080"; // original "3f51b5";
  dev_log("render MyAppBar");
  return (
    <AppBar
      position="absolute"
      style={{ opacity: "50%", backgroundColor: APP_BAR_BGCOLOR }}
      id="appbar"
    >
      <Toolbar>
        <MainMenu />
        <Typography variant="h6">Kozaneba</Typography>
        <UserButtons />
        <DevMenu />
      </Toolbar>
    </AppBar>
  );
};
