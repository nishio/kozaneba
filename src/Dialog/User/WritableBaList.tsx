import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse, List, ListItem, ListItemText } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { useState } from "react";
import { date_to_str } from "../../utils/date_to_str";
import { Ba } from "./UserDialog";

export const WritableBaList = (ba_list: Ba[] | null) => {
  const [is_open, set_is_open] = useState(true);
  let items = [
    <div style={{ height: "100vh" }}>
      <span key="loading">
        Loading...
        <FontAwesomeIcon icon={faSpinner} spin={true} />
      </span>
    </div>,
  ];
  if (ba_list !== null) {
    if (ba_list.length === 0) {
      items = [<span key="no_item">Not saved yet</span>];
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
            primary={"\t" + date_to_str(x.last_updated) + ": " + x.title}
          />
        </ListItem>
      ));
    }
  }
  // return (
  //   <List
  //     subheader={
  //       <ListSubheader
  //         component="div"
  //         style={{ paddingLeft: "0px", lineHeight: "", paddingTop: "1em" }}
  //       >
  //         Writable Ba
  //       </ListSubheader>
  //     }
  //   >
  //     {items}
  //   </List>
  // );
  const onClick = () => {
    set_is_open(!is_open);
  };

  return (
    <>
      <ListItem button onClick={onClick} style={{ paddingLeft: 0 }}>
        <ListItemText primary="Ba which you can write" />
        {is_open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={is_open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items}
        </List>
      </Collapse>
    </>
  );
};
