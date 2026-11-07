import { getGlobal, useGlobal } from "reactn";
import { State } from "reactn/default";
import { get_items_bounding_box } from "../../dimension/get_group_bounding_box";
import { TAnnotation } from "../../Global/TAnnotation";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { equal_v2, V2 } from "../../dimension/V2";
import { get_global_position } from "../../dimension/get_global_position";
import { LineAnnot } from "./LineAnnot";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";
import { get_global_item_rect } from "./line_geometry";

const get_contents_bound = () => {
  const g = getGlobal();
  return get_items_bounding_box(g.drawOrder);
};

const DraftLine = ({
  p1,
  p2,
  testid,
}: {
  p1: V2;
  p2: V2;
  testid: string;
}) => {
  if (equal_v2(p1, p2)) return null;
  return (
    <line
      data-testid={testid}
      x1={p1[0]}
      y1={p1[1]}
      x2={p2[0]}
      y2={p2[1]}
      stroke="black"
      strokeDasharray="6 5"
      strokeLinecap="round"
      strokeWidth={2}
      style={{ opacity: 0.34, pointerEvents: "none" }}
    />
  );
};

const render_draft_line = (g: State) => {
  const draft = g.line_draft_state;
  if (draft === null) return null;
  const start_rect = get_global_item_rect(draft.start_id, g);
  const start_center = get_global_position(draft.start_id, g);
  const start = get_box_line_crosspoint(
    start_center,
    draft.pointer,
    start_rect
  );
  if (start === undefined) return null;
  return <DraftLine p1={start} p2={draft.pointer} testid="line-draft-preview" />;
};

const render_retarget_line = (g: State) => {
  const edit = g.line_edit_state;
  if (
    edit === null ||
    edit.retarget_endpoint === null ||
    edit.pointer === null
  ) {
    return null;
  }
  const annotation = g.annotations[edit.annot_index];
  if (annotation?.type !== "line" || annotation.items.length !== 2) return null;
  const other_id = annotation.items[edit.retarget_endpoint === 0 ? 1 : 0]!;
  const other_rect = get_global_item_rect(other_id, g);
  const other_center = get_global_position(other_id, g);
  const start = get_box_line_crosspoint(other_center, edit.pointer, other_rect);
  if (start === undefined) return null;
  return (
    <DraftLine
      p1={start}
      p2={edit.pointer}
      testid="line-retarget-preview"
    />
  );
};

const render_target_highlight = (g: State) => {
  const hover_target =
    g.line_draft_state?.hover_target ||
    g.line_edit_state?.hover_target ||
    "";
  if (hover_target === "") return null;
  const rect = get_global_item_rect(hover_target, g);
  return (
    <rect
      data-testid="line-target-highlight"
      x={rect.left - 4}
      y={rect.top - 4}
      width={rect.width + 8}
      height={rect.height + 8}
      rx={3}
      fill="none"
      stroke="#222"
      strokeDasharray="4 3"
      strokeWidth={2}
      style={{ opacity: 0.45, pointerEvents: "none" }}
    />
  );
};

export const AnnotationLayer = () => {
  const [g] = useGlobal();

  const annotElement = g.annotations.flatMap((a: TAnnotation, index) => {
    if (a.type === "line") {
      return LineAnnot(g, a, index);
    }
    return [];
  });
  const b = get_contents_bound();
  const content_rect = bounding_box_to_rect(b);
  const padding = 220;
  const r = {
    top: content_rect.top - padding,
    left: content_rect.left - padding,
    width: content_rect.width + padding * 2,
    height: content_rect.height + padding * 2,
  };
  return (
    <svg
      version="1.1"
      width={r.width}
      height={r.height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: r.top + "px",
        left: r.left + "px",
        pointerEvents: "none", // paththrogh event on background
      }}
      viewBox={`${r.left} ${r.top} ${r.width} ${r.height}`}
    >
      {annotElement}
      {render_draft_line(g)}
      {render_retarget_line(g)}
      {render_target_highlight(g)}
    </svg>
  );
};
