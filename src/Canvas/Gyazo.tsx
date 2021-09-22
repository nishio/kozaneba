import { CSSProperties } from "@material-ui/core/styles/withStyles";
import React from "react";
import { useRef, useState } from "reactn";
import styled from "styled-components";
import { TOffset } from "../dimension/TOffset";
import { add_v2w, mul_v2, V2 } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { onGenericMouseDown } from "../Event/onGenericMouseDown";
import { TGyazoItem } from "../Global/TGyazoItem";
import { position_to_left_top } from "../dimension/position_to_left_top";
import { modify_image_url } from "../utils/modify_image_url";
import {
  base_size_cache,
  GYAZO_BORDER,
  GYAZO_SIZE,
} from "./get_gyazo_bounding_box";

type Props = {
  value: TGyazoItem;
  offset: TOffset;
};

export const GyazoImg = styled.img`
  border: #aaa ${GYAZO_BORDER}px solid;
  position: absolute;
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};
`;

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
