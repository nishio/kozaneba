import React from "react";
import styled from "styled-components";
import { KozaneDiv, KozaneDiv2 } from "../Kozane/KozaneDiv";

export const INITIAL = 128;
export const cache = { "": INITIAL } as { [key: string]: number };

const HiddenKozaneDiv = styled(KozaneDiv)`
  visibility: hidden;
  background-color: blue;
  position: absolute;
  top: 0;
`;
export const AdjustFontSize = () => {
  return (
    <HiddenKozaneDiv id="hidden-kozane">
      <KozaneDiv2></KozaneDiv2>
    </HiddenKozaneDiv>
  );
};

const getHiddenKozane = (hiddenKozane?: HTMLDivElement) => {
  if (hiddenKozane === undefined) {
    return document.getElementById("hidden-kozane") as HTMLDivElement;
  }
  return hiddenKozane;
};

export const adjustFontSize = (
  text: string,
  testHiddenKozane?: HTMLDivElement
): number => {
  const in_cache = cache[text];
  if (in_cache !== undefined && testHiddenKozane !== undefined) {
    return in_cache;
  }
  const x = getHiddenKozane(testHiddenKozane);
  (x.children[0] as HTMLDivElement).innerText = text;
  cache[text] = INITIAL;
  x.style.fontSize = cache[text] + "px";

  let left = 0;
  let right = INITIAL;
  while (left < right - 1) {
    const mid = (left + right) / 2;
    cache[text] = mid;
    x.style.fontSize = cache[text] + "px";
    if (x.scrollHeight > 100) {
      right = mid;
    } else {
      left = mid;
    }
  }
  cache[text] = left;
  // console.log(text, cache[text]);
  return left;
};
/*
あ 67
ああ 67
あああ 46
あああああ 33
ああああああああ 33
あああああああああああああ 22
あああああああああああああああああああああ 20
ああああああああああああああああああああああああああああああああああ 15
あああああああああああああああああああああああああああああああああああああああああああああああああああああああ 12
あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ 0 
 */
