import { Line, parse } from "@progfay/scrapbox-parser";
import React from "react";
import { getGlobal } from "../Global/ReactnCompat";
import { TKozaneItem } from "../Global/TKozaneItem";
import { make_scrapbox_url } from "../Scrapbox/make_scrapbox_kozane";

export const build_content = (value: TKozaneItem) => {
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
          return <img src={src} style={{ height: "1em" }} alt={node.path} />;
        } else if (node.pathType === "root") {
          const src = `https://scrapbox.io/api/pages/${node.path}/icon`;
          return <img src={src} style={{ height: "1em" }} alt={node.path} />;
        } else {
          console.log(node);
        }
      } else if (node.type === "link") {
        console.log(node);
        if (node.pathType === "relative") {
          // const src = `https://scrapbox.io/${proj}/${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          return <span style={{ color: "blue" }}>{node.raw}</span>;
        } else if (node.pathType === "root") {
          // const src = `https://scrapbox.io/api/pages/${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          return <span style={{ color: "blue" }}>{node.raw}</span>;
        } else if (node.pathType === "absolute") {
          // const src = `https://scrapbox.io/api/pages/${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          return <span style={{ color: "blue" }}>[URL]</span>;
        } else {
          console.log(node);
          return node.raw;
        }
      } else {
        console.log(node);
        return node.raw;
      }
      return null;
    });
  }
};

export const get_scarpbox_links = (value: TKozaneItem) => {
  const links: string[] = [];
  const g = getGlobal();
  const proj = g.scrapbox;
  if (proj !== "") {
    const page = parse("DUMMY_TITLE\n" + value.text);
    const line = page[1] as Line;

    line.nodes.forEach((node) => {
      if (node.type === "link") {
        console.log(node);
        if (node.pathType === "relative") {
          const url = make_scrapbox_url(
            `https://scrapbox.io/${proj}`,
            node.href
          );

          links.push(url);
        } else if (node.pathType === "root") {
          const url = `https://scrapbox.io${node.href}`;
          // return <a href={src}> {node.raw} </a>;
          links.push(url);
        } else {
          links.push(node.href);
        }
      }
    });
  }
  return links;
};
