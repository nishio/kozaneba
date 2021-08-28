import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
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

export const ScrapboxDiv = styled.div`
  width: 400px;
  height: 400px;
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
export const Scrapbox: React.FC<Props> = ({ value, offset }) => {
  let contents = null;
  if (value.icon !== "") {
    contents = <img src={value.icon} alt="" style={{ maxWidth: "100%" }} />;
  } else {
    contents = (
      <div style={{ padding: "10px 12px 0" }}>
        {value.description.map((x, i) => {
          return <ScrapboxLine key={i}>{x}</ScrapboxLine>;
        })}
      </div>
    );
  }
  return (
    <ScrapboxDiv style={position_to_left_top(value.position)}>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 500 }}>
          <strong>{value.text}</strong>
        </div>
      </div>
      {contents}
    </ScrapboxDiv>
  );
};
