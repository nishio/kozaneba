import { useGlobal } from "reactn";
import styled from "styled-components";

const CenterDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0px;
  height: 0px;
  overflow: visible;
`;

export const Center: React.FC<{ opacity: number }> = ({
  children,
  opacity,
}) => {
  const [g] = useGlobal();
  const style = {
    opacity,
    transform: `scale(${g.scale}) translate(${g.trans_x}px, ${g.trans_y}px)`,
  };
  return (
    <CenterDiv style={style} id="center">
      {children}
    </CenterDiv>
  );
};
