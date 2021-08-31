import { CSSProperties } from "@material-ui/core/styles/withStyles";
import React from "react";
import { useRef, useState } from "reactn";
import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { add_v2w, mul_v2, V2 } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { onGenericMouseDown } from "../Event/onGenericMouseDown";
import { TGyazoItem } from "../Global/initializeGlobalState";
import { position_to_left_top } from "../Kozane/position_to_left_top";
import { modify_image_url } from "./modify_image_url";

const GYAZO_SIZE = 200;
const GYAZO_BORDER = 1;
type Props = {
  value: TGyazoItem;
  offset: TOffset;
};

export const get_gyazo_bounding_box = (item: TGyazoItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  if (!(item.url in base_size_cache)) {
    return { top: y, left: x, bottom: y, right: x };
  }
  const [w, h] = base_size_cache[item.url]!;
  const b = {
    top: y - (h / 2) * scale,
    left: x - (w / 2) * scale,
    bottom: y + (h / 2) * scale,
    right: x + (w / 2) * scale,
  };
  return b;
};

export const GyazoImg = styled.img`
  border: #aaa ${GYAZO_BORDER}px solid;
  position: absolute;
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};
`;

const base_size_cache: { [url: string]: [number, number] } = {};

export const Gyazo: React.FC<Props> = ({ value, offset }) => {
  const [base_size, set_base_size] = useState([0, 0] as V2);
  const [loaded, set_loaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const onLoad = () => {
    const [w, h] = [ref.current!.width, ref.current!.height];
    const scale = GYAZO_SIZE / Math.max(w, h);
    const base_size = mul_v2(scale, [w, h]);
    set_base_size(base_size);
    base_size_cache[value.url] = base_size;
    set_loaded(true);
  };

  const [w, h] = base_size;
  const f = (v: number) => {
    if (v === 0) {
      return "";
    }
    return v * value.scale;
  };

  const o = [
    offset.x - (value.scale * w) / 2 - GYAZO_BORDER,
    offset.y - (value.scale * h) / 2 - GYAZO_BORDER,
  ] as TWorldCoord;
  const left_top = position_to_left_top(add_v2w(value.position, o));

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onGenericMouseDown(e, value);
  };

  const style: CSSProperties = {
    ...(value.custom?.style ?? {}),
    ...left_top,
    width: f(w),
    height: f(h),
    visibility: loaded ? "visible" : "hidden",
  };
  return (
    <>
      <GyazoImg
        data-testid={value.id}
        ref={ref}
        src={modify_image_url(value.url)}
        alt=""
        onLoad={onLoad}
        style={style}
        onMouseDown={onMouseDown}
      />
      {loaded ? null : <img src="spinner.gif" alt="" />}
    </>
  );
};
