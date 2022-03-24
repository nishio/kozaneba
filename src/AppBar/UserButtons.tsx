import { Button } from "@mui/material";

export const UserButtons = () => {
  return (
    <>
      {user_buttons.map((x) => (
        <Button
          color="inherit"
          onClick={x.onClick}
          key={x.label}
          className="user-button"
        >
          {x.label}
        </Button>
      ))}
    </>
  );
};
type TUserButton = { label: string; onClick: () => void };
export const user_buttons: TUserButton[] = [];
