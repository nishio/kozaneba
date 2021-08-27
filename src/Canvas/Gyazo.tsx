import { useRef, useState } from "reactn";
import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { TGyazoItem } from "../Global/initializeGlobalState";

type Props = {
  value: TGyazoItem;
  offset: TOffset;
};

export const GyazoImg = styled.img`
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};
  border: #aaa 1px solid;
  position: absolute;
`;

export const Gyazo: React.FC<Props> = ({ value, offset }) => {
  const [base_width, set_base_width] = useState(0);
  const [base_height, set_base_height] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const onLoad = () => {
    console.log(ref.current!.width, ref.current!.height);
    const scale = 200 / Math.max(ref.current!.width, ref.current!.height);
    set_base_width(ref.current!.width * scale);
    set_base_height(ref.current!.height * scale);
  };
  const f = (v: number) => {
    if (v === 0) {
      return "";
    }
    return v * value.scale;
  };
  return (
    <GyazoImg
      ref={ref}
      src={value.url + "/thumb/400"}
      alt=""
      onLoad={onLoad}
      style={{
        width: f(base_width),
        height: f(base_height),
      }}
    />
  );
};
