import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { CSSProperties } from "react";
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
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};
