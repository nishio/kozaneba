import { Button } from "@mui/material";
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
      <Button color="inherit" onClick={onButtonClick}>
        <FontAwesomeIcon size="lg" icon={faQuestionCircle} />
      </Button>
    </>
  );
};
