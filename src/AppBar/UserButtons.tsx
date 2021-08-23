import { Button } from "@material-ui/core";
import { useStyles } from "./DevMenu";

export const UserButtons = () => {
  const classess = useStyles();

  return (
    <>
      {user_buttons.map((x) => (
        <Button color="inherit" onClick={x.onClick} className={classess.root}>
          {x.label}
        </Button>
      ))}
    </>
  );
};
type TUserButton = { label: string; onClick: () => void };
export const user_buttons: TUserButton[] = [];
