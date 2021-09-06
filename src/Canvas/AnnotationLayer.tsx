import { useGlobal } from "reactn";
import { TAnnotation } from "../Global/TAnnotation";
import { LineAnnot } from "./LineAnnot";

export const AnnotationLayer = () => {
  const [g] = useGlobal();
  const WIDTH = document.body.clientWidth;
  const HEIGHT = document.body.clientHeight;

  const annotElement = g.annotations.flatMap((a: TAnnotation) => {
    if (a.type === "line") {
      return LineAnnot(g, a);
    }
    return [];
  });

  return (
    <svg
      version="1.1"
      width={WIDTH}
      height={HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: -HEIGHT / 2 + "px",
        left: -WIDTH / 2 + "px",
        pointerEvents: "none", // paththrogh event on background
      }}
      viewBox={`-${WIDTH / 2} -${HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
    >
      {annotElement}
    </svg>
  );
};
