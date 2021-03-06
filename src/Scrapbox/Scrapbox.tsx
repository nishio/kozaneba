import { CSSProperties } from "styled-components";
import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { add_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { onGenericMouseDown } from "../Event/onGenericMouseDown";
import { TScrapboxItem } from "../Global/TScrapboxItem";
import { NoSelect } from "../Group/GroupDiv";
import { position_to_left_top } from "../dimension/position_to_left_top";
import { modify_image_url } from "../utils/modify_image_url";
import { get_scrapbox_bounding_box } from "./get_scrapbox_bounding_box";

type Props = {
  value: TScrapboxItem;
  offset: TOffset;
};
const ScrapboxLine = styled.p`
  margin: 0;
`;

export const ScrapboxDiv = styled.div`
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  border: #aaa 1px solid;
  position: absolute;
  border-radius: 15px;
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};

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

export const Scrapbox: React.FC<Props> = ({ value, offset }) => {
  let contents = null;
  if (value.image !== "") {
    const src = modify_image_url(value.image);
    const style: CSSProperties = {
      maxWidth: "100%",
      position: "relative",
    };
    contents = <img src={src} alt="" style={style} draggable="false" />;
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
