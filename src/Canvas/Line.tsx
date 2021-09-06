import { V2 } from "../dimension/V2";

export const Line = (p1: V2, p2: V2, onClick: () => void) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="10"
      strokeLinecap="round"
      onClick={onClick}
      style={{
        pointerEvents: "auto",
      }}
    />
  );
};
