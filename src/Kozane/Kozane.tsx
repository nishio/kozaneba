import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Line, parse } from "@progfay/scrapbox-parser";
import React, { CSSProperties } from "react";
import { getGlobal } from "reactn";
import { TOffset } from "../dimension/TOffset";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { TKozaneItem } from "../Global/TKozaneItem";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";

type Props = {
  value: TKozaneItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const Kozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const custom = value.custom?.style ?? {};
  const style = {
    ...useAdjustFontsizeStyle(value, offset),
    ...custom_style,
    ...custom,
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onKozaneMouseDown(e, value);
  };
  const link_mark = () => {
    const url = value.custom?.url;
    if (url !== "" && url !== undefined) {
      return (
        <FontAwesomeIcon
          icon={faExternalLinkAlt}
          style={{
            position: "absolute",
            fontSize: 15 * value.scale + "px",
            right: 0,
            bottom: 0,
            opacity: 0.5,
          }}
        />
      );
    }
    return null;
  };

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onMouseDown}
    >
      {link_mark()}
      <KozaneDiv2>{build_content(value)}</KozaneDiv2>
    </KozaneDiv>
  );
};

const build_content = (value: TKozaneItem) => {
  const g = getGlobal();
  const proj = g.scrapbox;
  if (proj === "") {
    return value.text; // simple string
  } else {
    const page = parse("DUMMY_TITLE\n" + value.text);
    const line = page[1] as Line;
    return line.nodes.map((node) => {
      if (node.type === "plain") {
        return node.text;
      } else if (node.type === "icon") {
        if (node.pathType === "relative") {
          const src = `https://scrapbox.io/api/pages/${proj}/${node.path}/icon`;
          return <img src={src} style={{ height: "1em" }} />;
        } else if (node.pathType === "root") {
          const src = `https://scrapbox.io/api/pages/${node.path}/icon`;
          return <img src={src} style={{ height: "1em" }} />;
        } else {
          console.log(node);
        }
      } else if (node.type === "link") {
        console.log(node);
        if (node.pathType === "relative") {
          const src = `https://scrapbox.io/${proj}/${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          return <span style={{ color: "blue" }}>{node.raw}</span>;
        } else if (node.pathType === "root") {
          const src = `https://scrapbox.io/api/pages/${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          return <span style={{ color: "blue" }}>{node.raw}</span>;
        } else {
          console.log(node);
          return node.raw;
        }
      } else {
        console.log(node);
        return node.raw;
      }
    });
  }
};
