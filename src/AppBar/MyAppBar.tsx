import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { MainMenu } from "./MainMenu";
import { DevMenu } from "./DevMenu";

export const MyAppBar = () => {
  const APP_BAR_BGCOLOR = "#000080"; // original "3f51b5";
  return (
    <AppBar
      position="absolute"
      style={{ opacity: "50%", backgroundColor: APP_BAR_BGCOLOR }}
      id="appbar"
    >
      <Toolbar>
        <MainMenu />
        <Typography variant="h6">Kozaneba</Typography>
        <DevMenu />
      </Toolbar>
    </AppBar>
  );
};
