import { Collapse, List, ListItem, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { setGlobal, useState } from "reactn";
import { tutorial_pages } from "./tutorial_pages";

export type HelpPage = {
  title: string;
  body: JSX.Element;
  page_no?: number;
  translate?: { [lang: string]: { title: string; body: JSX.Element } };
};

const other_pages: HelpPage[] = [
  {
    title: "Don't classify, organize!",
    body: (
      <div>
        <p>
          Some people try to classify kozane. There is a misconception that
          kozane is a tool to categorize and store information.
        </p>
        <p>
          Kozane is a tool to recombine and rearrange information. By doing
          this, we often find connections between kozane that seem to have
          nothing related to each other. After discovering unexpected
          relationships, kozane is organized into a structure that you did not
          anticipate beforehand.
        </p>
        <p>
          Kozane is like fish. If you put them into where they can not swim,
          they will die. Don't classify kozane by its content, but organize them
          by your personal interest.
        </p>
        <p>
          (This page is a digest from a book by Tadao Umesao, who invented
          Kozane Method. Reference: "Classification is not the goal" from Tadao
          Umesao (1969) "The Art of Intellectual Production" p.57)
        </p>
      </div>
    ),
  },
];
export const help_pages: HelpPage[] = [
  {
    title: "Table of contents",
    body: <></>, // filled after
  },
  ...tutorial_pages,
  ...other_pages,
];

help_pages.forEach((value, index) => {
  value.page_no = index;
});

const TOC = () => {
  const [isOpenTutorial, setIsOpenTutorial] = useState(false);
  const onOpenTutorial = () => {
    setIsOpenTutorial(!isOpenTutorial);
  };
  const make_LI = (x: HelpPage) => (
    <ListItem
      button
      style={{
        paddingLeft: "2em",
        paddingTop: 0,
        paddingBottom: 0,
        lineHeight: 1,
      }}
      onClick={() => {
        setGlobal({ tutorial_page: x.page_no });
      }}
      key={x.page_no}
    >
      <ListItemText primary={x.title} />
    </ListItem>
  );
  const tutorial_items = tutorial_pages.map(make_LI);
  const other_items = other_pages.map(make_LI);
  return (
    <div>
      <ListItem button onClick={onOpenTutorial}>
        <ListItemText primary="Section 1: Tutorial" />
        {isOpenTutorial ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpenTutorial} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {tutorial_items}
        </List>
      </Collapse>
      <ListItem button onClick={onOpenTutorial}>
        <ListItemText primary="Section 2:" />
      </ListItem>
      {other_items}
    </div>
  );
};

help_pages[0]!.body = <TOC />;
