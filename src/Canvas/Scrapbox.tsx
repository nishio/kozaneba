import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { add_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { onGenericMouseDown } from "../Event/onGenericMouseDown";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { NoSelect } from "../Group/GroupDiv";
import { position_to_left_top } from "../Kozane/position_to_left_top";
import { modify_image_url } from "./modify_image_url";

type Props = {
  value: TScrapboxItem;
  offset: TOffset;
};
const ScrapboxLine = styled.p`
  margin: 0;
`;

export const SCRAPBOX_SIZE = 400;
export const ScrapboxDiv = styled.div`
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  border: #aaa 1px solid;
  position: absolute;
  border-radius: 15px;
  ${NoSelect};
`;

const ScrapboxBack = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  top: -1px;
  left: -1px;
`;

export const get_scrapbox_bounding_box = (item: TScrapboxItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (SCRAPBOX_SIZE / 2) * scale,
    left: x - (SCRAPBOX_SIZE / 2) * scale,
    bottom: y + (SCRAPBOX_SIZE / 2) * scale,
    right: x + (SCRAPBOX_SIZE / 2) * scale,
  };
  return b;
};

export const Scrapbox: React.FC<Props> = ({ value, offset }) => {
  let contents = null;
  if (value.image !== "") {
    contents = (
      <img
        src={modify_image_url(value.image)}
        alt=""
        style={{
          maxWidth: "100%",
          position: "relative",
        }}
        draggable="false"
      />
    );
  } else {
    contents = (
      <div style={{ padding: "10px 12px 0", position: "relative" }}>
        {value.description.map((x, i) => {
          return <ScrapboxLine key={i}>{x}</ScrapboxLine>;
        })}
      </div>
    );
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onGenericMouseDown(e, value);
  };

  const b = get_scrapbox_bounding_box(value);
  const left_top = position_to_left_top(
    add_v2w([b.left, b.top] as TWorldCoord, [offset.x, offset.y] as TWorldCoord)
  );
  const width = b.right - b.left;
  const height = b.bottom - b.top;
  const style = {
    ...left_top,
    width,
    height,
    fontSize: 200 * value.scale + "%",
  };

  const lineHeight = 40 * value.scale;
  return (
    <ScrapboxDiv onMouseDown={onMouseDown} style={style}>
      <ScrapboxBack />
      <div>
        <div
          style={{
            position: "relative",
            padding: "10px 12px",
            lineHeight: lineHeight + "px",
            maxHeight: lineHeight * 3 - 10 + "px",
          }}
        >
          <div style={{ fontWeight: 500 }}>
            <strong>{value.text}</strong>
          </div>
        </div>
        {contents}
      </div>
    </ScrapboxDiv>
  );
};
