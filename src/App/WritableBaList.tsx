import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { List, ListItem, ListItemText, ListSubheader } from "@material-ui/core";
import { date_to_str } from "../utils/date_to_str";
import { Ba } from "./UserDialog";

export const WritableBaList = (ba_list: Ba[] | null) => {
  let items = [
    <span>
      Loading...
      <FontAwesomeIcon icon={faSpinner} spin={true} />
    </span>,
  ];
  if (ba_list !== null) {
    if (ba_list.length === 0) {
      items = [<span>Not saved yet</span>];
    } else {
      items = ba_list.map((x) => (
        <ListItem
          button
          onClick={() => {
            window.open("/#edit=" + x.id, "_blank");
          }}
          style={{}}
          data-testid={`edit-link-${x.id}`}
          key={x.id}
        >
          <ListItemText
            primary={date_to_str(x.last_updated) + ": " + x.title}
          />
        </ListItem>
      ));
    }
  }
  return (
    <List
      subheader={<ListSubheader component="div">Writable Ba</ListSubheader>}
    >
      {items}
    </List>
  );
};
