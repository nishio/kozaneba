import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { CSSProperties, useMemo, useCallback } from "react";
import { useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { TOffset } from "../dimension/TOffset";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { TKozaneItem } from "../Global/TKozaneItem";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { build_content } from "./parse_as_scrapbox";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";

type Props = {
  value: TKozaneItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const Kozane: React.FC<Props> = React.memo(({
  value,
  offset,
  custom_style = {},
}) => {
  const [print_mode] = useGlobal("print_mode");
  const custom = value.custom?.style ?? {};
  const adjustedStyle = useAdjustFontsizeStyle(value, offset, print_mode);
  const style = useMemo(() => ({
    ...adjustedStyle,
    ...custom_style,
    ...custom,
  }), [adjustedStyle, custom_style, custom]);
  let content = build_content(value);

  if (kozaneba.constants.exp_no_adjust && value.text.startsWith("#")) {
    style.fontSize = 100 * value.scale;
    style.width = "unset";
    style.height = "unset";
    style.wordWrap = "unset";
    style.overflow = "visible";
    content = [
      <span style={{ whiteSpace: "nowrap" }}>{value.text.substring(1)}</span>,
    ];
  }

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onKozaneMouseDown(e, value);
  }, [value]);

  const link_mark = useCallback(() => {
    const url = value.custom?.url;
    if (url !== "" && url !== undefined) {
      return (
        <div
          style={{
            position: "absolute",
            fontSize: 15 * value.scale + "px",
            right: 0,
            bottom: 0,
          }}
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} color="#888" />
          <img
            src={`https://s2.googleusercontent.com/s2/favicons?domain=${url}`}
            alt="favicon"
            style={{ verticalAlign: "text-bottom", marginLeft: "1px" }}
          ></img>
        </div>
      );
    }
    return null;
  }, [value.custom?.url, value.scale]);

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onMouseDown}
    >
      {link_mark()}
      <KozaneDiv2>{content}</KozaneDiv2>
    </KozaneDiv>
  );
});
