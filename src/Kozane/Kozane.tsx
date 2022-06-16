import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { CSSProperties } from "react";
import { useGlobal } from "reactn";
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

export const Kozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const [print_mode] = useGlobal("print_mode");
  const custom = value.custom?.style ?? {};
  const style = {
    ...useAdjustFontsizeStyle(value, offset, print_mode),
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
