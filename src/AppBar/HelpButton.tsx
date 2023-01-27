import { IconButton } from "@mui/material";
import { updateGlobal } from "../Global/updateGlobal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

export const HelpButton = () => {
  const onButtonClick = () => {
    updateGlobal((g) => {
      g.dialog = "Tutorial";
    });
  };
  return (
    <>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={onButtonClick}
        data-testid="help-icon-button"
        style={{
          marginLeft: "auto",
        }}
      >
        <FontAwesomeIcon size="lg" icon={faQuestionCircle} />
      </IconButton>
    </>
  );
};
