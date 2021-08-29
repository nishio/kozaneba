import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { add_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { NoSelect } from "../Group/GroupDiv";
import { position_to_left_top } from "../Kozane/position_to_left_top";

type Props = {
  value: TScrapboxItem;
  offset: TOffset;
};
const ScrapboxLine = styled.p`
  margin: 0;
`;

const SCRAPBOX_SIZE = 400;
export const ScrapboxDiv = styled.div`
  width: ${SCRAPBOX_SIZE}px;
  height: ${SCRAPBOX_SIZE}px;
  font-size: 200%;
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};
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
        src={value.image + "/thumb/400"}
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
    onKozaneMouseDown(e, value);
  };

  const b = get_scrapbox_bounding_box(value);

  return (
    <ScrapboxDiv
      style={position_to_left_top(
        add_v2w(
          [b.left, b.top] as TWorldCoord,
          [offset.x, offset.y] as TWorldCoord
        )
      )}
      onMouseDown={onMouseDown}
    >
      <ScrapboxBack />
      <div>
        <div style={{ position: "relative", padding: "10px 12px" }}>
          <div style={{ fontWeight: 500 }}>
            <strong>{value.text}</strong>
          </div>
        </div>
        {contents}
      </div>
    </ScrapboxDiv>
  );
};
