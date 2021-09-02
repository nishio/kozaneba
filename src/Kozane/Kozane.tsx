import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { CSSProperties } from "react";
import { TOffset } from "../dimension/TOffset";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { dev_log } from "../utils/dev";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { TKozaneItem } from "./KozaneItem";
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
          icon={faLink}
          style={{
            position: "absolute",
            fontSize: 20 * value.scale + "px",
            top: 0,
          }}
        />
      );
    }
    return null;
  };
  dev_log("style", style);
  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onMouseDown}
    >
      {link_mark()}
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};
