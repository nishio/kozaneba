import type {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { State } from "reactn/default";
import { kozaneba } from "../../API/KozanebaAPI";
import { get_global_position } from "../../dimension/get_global_position";
import {
  add_v2,
  equal_v2,
  L2norm,
  mul_v2,
  normalize,
  rotate,
  sub_v2,
  V2,
} from "../../dimension/V2";
import {
  commitLineEdit,
  deleteLineEditAnnotation,
  openLineEdit,
  setLineEditStyle,
  startLineEndpointRetarget,
  updateLineEditValue,
} from "../../Global/line_edit_actions";
import { TLineAnnot } from "../../Global/TAnnotation";
import { TItemId } from "../../Global/TItemId";
import { TLineEditStyle } from "../../Global/initializeGlobalState";
import { KOZANE_WIDTH } from "../../utils/kozane_constants";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";
import { get_middle_point } from "./get_middle_point";
import { Line } from "./Line";
import { get_global_item_rect } from "./line_geometry";

const arrow_angle = 30; // degrees
const arrow_tan = Math.tan((arrow_angle / 180) * Math.PI);
const arrow_sin = Math.sin((arrow_angle / 180) * Math.PI);
const line_style_options: {
  style: TLineEditStyle;
  label: string;
  title: string;
}[] = [
  { style: "line", label: "-", title: "Line" },
  { style: "arrow", label: "->", title: "Arrow" },
  { style: "double_heads", label: "<->", title: "Bidirectional arrow" },
  { style: "double_lines", label: "=", title: "Double line" },
];

const get_line_style = (annotation: TLineAnnot): TLineEditStyle => {
  if (annotation.is_doubled) return "double_lines";
  if (annotation.heads[0] === "arrow" && annotation.heads[1] === "arrow") {
    return "double_heads";
  }
  if (annotation.heads[1] === "arrow") return "arrow";
  return "line";
};

export const LineAnnot = (g: State, a: TLineAnnot, annot_index: number) => {
  const lines = [] as [V2, V2, number][];
  // currently ignore items[2~], and item deletion
  const positions = a.items.map((id: TItemId) => get_global_position(id, g));
  const center = get_middle_point(positions);

  const is_doubled = a.is_doubled;
  const stroke_width = a.custom?.stroke_width ?? 1;

  const arrow_head_size =
    (a.custom?.arrow_head_size ?? 10) +
    (is_doubled ? stroke_width / arrow_sin : 0);

  let group_opacity = 1.0;
  const opacity_from_length = (length: number): number => {
    const threshold = KOZANE_WIDTH;
    if (!kozaneba.constants.to_adjust_opacity_of_lines_by_length) {
      return 1;
    }
    if (length < threshold) {
      return 1;
    } else if (length < threshold * 3) {
      // from 1.0 to 0.1
      return 1 + (-0.9 * (length - threshold)) / (2 * threshold);
    }
    return 0.1;
  };

  const draw_arrowhead = (
    h: "none" | "arrow" | undefined,
    head: V2,
    tail: V2,
    index: number
  ): void => {
    if (h === "arrow") {
      if (head === undefined || equal_v2(head, tail)) return;
      // arrow head
      const n = normalize(sub_v2(head, tail));
      const h1 = sub_v2(head, mul_v2(arrow_head_size, rotate(n, arrow_angle)));
      const h2 = sub_v2(head, mul_v2(arrow_head_size, rotate(n, -arrow_angle)));

      lines.push([h1, head, 1]);
      lines.push([h2, head, 1]);
    }
  };

  if (a.items.length === 2) {
    if (equal_v2(positions[0]!, positions[1]!)) {
      // same point. e.g. in the same closed group
      return [];
    }
  }

  const rects = a.items.map((id: TItemId) => get_global_item_rect(id, g));
  const crosspoints = a.items.map((id: TItemId, index: number) => {
    const p = positions[index]!;
    if (!equal_v2(p, center)) {
      return get_box_line_crosspoint(p, center, rects[index]!);
    } else {
      return undefined;
    }
  });

  if (a.items.length === 2) {
    const cp0 = crosspoints[0];
    const cp1 = crosspoints[1];
    if (cp0 === undefined || cp1 === undefined || equal_v2(cp0, cp1)) {
      return [];
    }
    const v = sub_v2(cp1, cp0);
    const length = L2norm(v);
    const opacity = 1;
    group_opacity = Math.min(opacity_from_length(length), group_opacity);
    if (!is_doubled) {
      lines.push([cp0, cp1, opacity]);
    } else {
      // doubled line, if has head, shorten the line

      const n = normalize(sub_v2(cp0, cp1));
      const d = mul_v2(10, rotate(n, 90));
      const shorten = mul_v2(20, n);
      const p0 = a.heads[0] === "arrow" ? sub_v2(cp0, shorten) : cp0;
      const p1 = a.heads[1] === "arrow" ? add_v2(cp1, shorten) : cp1;
      lines.push([add_v2(p1, d), add_v2(p0, d), opacity]);
      lines.push([sub_v2(p1, d), sub_v2(p0, d), opacity]);
    }
    draw_arrowhead(a.heads[0], cp0, cp1, 0);
    draw_arrowhead(a.heads[1], cp1, cp0, 1);
    // end of (a.items.length === 2)
  } else {
    // a.items.length !== 2
    const angles = crosspoints.flatMap((cp: V2 | undefined) => {
      if (cp === undefined) return [];
      const d = sub_v2(center, cp);
      const th = Math.atan2(d[1], d[0]);
      return [th];
    });
    angles.sort((a: number, b: number) => a - b);

    crosspoints.forEach((cp: V2 | undefined, index: number) => {
      if (cp !== undefined && !equal_v2(center, cp)) {
        draw_arrowhead(a.heads[index], cp, center, index);
        const d = sub_v2(center, cp);
        const length = L2norm(d);
        group_opacity = Math.min(
          opacity_from_length(length) * 2,
          group_opacity
        );

        if (!is_doubled) {
          lines.push([center, cp, 1]);
        } else {
          // double lines
          const n = normalize(d);
          const side = mul_v2(stroke_width, rotate(n, 90));
          const shorten = mul_v2(stroke_width / arrow_tan, n);
          const p0 = a.heads[index] === "arrow" ? add_v2(cp, shorten) : cp;

          const angle = Math.atan2(d[1], d[0]);
          const N = angles.length;
          const i = angles.indexOf(angle);

          const next_angle = angles[(i + 1) % N]!;
          const prev_angle = angles[(i - 1 + N) % N]!;
          const max_shorten = L2norm(d);
          const angle_to_shorten = (th: number) => {
            return Math.min(
              max_shorten,
              stroke_width * (1 / Math.sin(th) + 1 / Math.tan(th))
            );
          };

          const shorten_next = angle_to_shorten(next_angle - angle);
          const shorten_prev = angle_to_shorten(angle - prev_angle);

          const p1n = sub_v2(center, mul_v2(shorten_next, n));
          const p1p = sub_v2(center, mul_v2(shorten_prev, n));
          lines.push([add_v2(p1p, side), add_v2(p0, side), 1]);
          lines.push([sub_v2(p1n, side), sub_v2(p0, side), 1]);
        }
      }
    });
  }

  const is_clickable = false;
  const onClick = undefined;
  const can_edit_line =
    g.mouseState !== "making_line" &&
    g.mouseState !== "drawing_line_anchor" &&
    a.items.length === 2;
  const is_editing = g.line_edit_state?.annot_index === annot_index;
  const editing_value = is_editing ? g.line_edit_state!.value : "";
  const current_style = get_line_style(a);

  const startLineEdit = (event: ReactMouseEvent<SVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!can_edit_line) return;
    openLineEdit(annot_index);
  };

  const onEditorChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateLineEditValue(annot_index, event.currentTarget.value);
  };

  const onEditorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      commitLineEdit();
    }
  };

  const stopMouseEvent = (event: ReactMouseEvent<Element>) => {
    event.stopPropagation();
  };
  const stopPointerEvent = (event: ReactPointerEvent<Element>) => {
    event.stopPropagation();
  };

  const custom_opacity = a.custom?.opacity ?? 0.2;

  const result = lines.map(([p1, p2, op], index) => {
    return Line(
      p1,
      p2,
      onClick,
      `line-${annot_index}-${index}`,
      stroke_width,
      1, // was: opacity * op,
      is_clickable
    );
  });

  const labelElement = a.label && !is_editing && can_edit_line ? (
    <text
      x={center[0]}
      y={center[1]}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fill="black"
      onClick={startLineEdit}
      onMouseDown={stopMouseEvent}
      onMouseUp={stopMouseEvent}
      onPointerDown={stopPointerEvent}
      onPointerUp={stopPointerEvent}
      style={{
        cursor: "text",
        pointerEvents: "auto",
        userSelect: "none",
      }}
      data-testid={`line-label-text-${annot_index}`}
    >
      <tspan
        x={center[0]}
        y={center[1]}
        style={{
          fill: "white",
          stroke: "white",
          strokeWidth: "3",
          paintOrder: "stroke",
        }}
      >
        {a.label}
      </tspan>
      <tspan x={center[0]} y={center[1]}>
        {a.label}
      </tspan>
    </text>
  ) : null;

  const midpointAffordance =
    !a.label && !is_editing && can_edit_line ? (
      <g
        className="line-midpoint-affordance"
        data-testid={`line-midpoint-affordance-${annot_index}`}
        onClick={startLineEdit}
        onMouseDown={stopMouseEvent}
        onMouseUp={stopMouseEvent}
        onPointerDown={stopPointerEvent}
        onPointerUp={stopPointerEvent}
        style={{ cursor: "text", pointerEvents: "auto" }}
      >
        <circle
          cx={center[0]}
          cy={center[1]}
          r={10}
          fill="black"
          opacity={0.001}
          data-testid={`line-midpoint-hit-${annot_index}`}
          style={{ pointerEvents: "auto" }}
        />
        <circle
          className="line-midpoint-dot"
          cx={center[0]}
          cy={center[1]}
          r={2}
          style={{ pointerEvents: "none" }}
        />
      </g>
    ) : null;

  const endpointHandles =
    is_editing && can_edit_line
      ? crosspoints.flatMap((point, endpoint) => {
          if (endpoint > 1 || point === undefined) return [];
          const endpoint_index = endpoint as 0 | 1;
          const onHandlePointerDown = (
            event: ReactPointerEvent<SVGCircleElement>
          ) => {
            startLineEndpointRetarget(event, annot_index, endpoint_index);
          };
          const onHandleMouseDown = (
            event: ReactMouseEvent<SVGCircleElement>
          ) => {
            startLineEndpointRetarget(event, annot_index, endpoint_index);
          };
          return [
            <g
              data-line-editor-root="true"
              key={`line-endpoint-handle-${annot_index}-${endpoint}`}
              style={{ pointerEvents: "auto" }}
            >
              <circle
                cx={point[0]}
                cy={point[1]}
                r={10}
                fill="black"
                opacity={0.001}
                data-testid={`line-endpoint-hit-${annot_index}-${endpoint}`}
                onClick={stopMouseEvent}
                onMouseDown={onHandleMouseDown}
                onPointerDown={onHandlePointerDown}
                style={{ cursor: "grab", pointerEvents: "auto" }}
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r={4}
                fill="white"
                stroke="black"
                strokeWidth={1.5}
                style={{ opacity: 0.78, pointerEvents: "none" }}
              />
            </g>,
          ];
        })
      : null;

  const editor_width = Math.max(178, Math.min(260, editing_value.length * 8 + 58));
  const editor_height = 74;
  const editor_top = center[1] + 18;
  const editorElement = is_editing ? (
    <>
      <line
        x1={center[0]}
        y1={center[1] + 4}
        x2={center[0]}
        y2={editor_top}
        stroke="black"
        strokeWidth={1}
        style={{ opacity: 0.32, pointerEvents: "none" }}
      />
      <foreignObject
        x={center[0] - editor_width / 2}
        y={editor_top}
        width={editor_width}
        height={editor_height}
        style={{ overflow: "visible", pointerEvents: "auto" }}
      >
        <div
          data-line-editor-root="true"
          data-testid={`line-edit-window-${annot_index}`}
          onMouseDown={stopMouseEvent}
          onMouseUp={stopMouseEvent}
          onPointerDown={stopPointerEvent}
          onPointerUp={stopPointerEvent}
          onClick={stopMouseEvent}
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            border: "1px solid rgba(0, 0, 0, 0.36)",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.22)",
            boxSizing: "border-box",
            color: "black",
            fontSize: "12px",
            padding: "6px",
            width: "100%",
          }}
        >
          <input
            autoFocus
            data-testid={`line-label-editor-${annot_index}`}
            placeholder="label"
            value={editing_value}
            onChange={onEditorChange}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={onEditorKeyDown}
            style={{
              background: "white",
              border: "1px solid #777",
              borderRadius: "3px",
              boxSizing: "border-box",
              color: "black",
              fontSize: "12px",
              height: "24px",
              lineHeight: "20px",
              outline: "none",
              padding: "1px 5px",
              textAlign: "center",
              width: "100%",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "4px",
              justifyContent: "center",
              marginTop: "6px",
            }}
          >
            {line_style_options.map((option) => {
              const active = current_style === option.style;
              return (
                <button
                  data-testid={`line-style-${option.style}-${annot_index}`}
                  key={option.style}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setLineEditStyle(annot_index, option.style);
                  }}
                  title={option.title}
                  type="button"
                  style={{
                    background: active ? "#222" : "#f7f7f7",
                    border: "1px solid #777",
                    borderRadius: "3px",
                    color: active ? "white" : "black",
                    cursor: "pointer",
                    fontSize: "11px",
                    height: "22px",
                    minWidth: "30px",
                    padding: "0 5px",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
            <button
              data-testid={`line-delete-${annot_index}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                deleteLineEditAnnotation(annot_index);
              }}
              title="Delete line"
              type="button"
              style={{
                background: "#fff",
                border: "1px solid #777",
                borderRadius: "3px",
                color: "black",
                cursor: "pointer",
                fontSize: "11px",
                height: "22px",
                minWidth: "34px",
                padding: "0 5px",
              }}
            >
              Del
            </button>
          </div>
        </div>
      </foreignObject>
    </>
  ) : null;

  return (
    <g key={`line-${annot_index}`}>
      <g opacity={custom_opacity * group_opacity}>
        {result}
        {labelElement}
        {midpointAffordance}
      </g>
      {endpointHandles}
      {editorElement}
    </g>
  );
};
