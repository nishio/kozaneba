import React from "react";
import styled from "styled-components";
import { FusenDiv, FusenDiv2 } from "./Fusen/FusenDiv";

export const INITIAL = 128;
export const cache = { "": INITIAL } as { [key: string]: number };

const HiddenFusenDiv = styled(FusenDiv)`
  visibility: hidden;
  background-color: blue;
  position: absolute;
  top: 0;
`;
export const AdjustFontSize = () => {
  return (
    <HiddenFusenDiv id="hidden-fusen" data-testid="hidden-fusen">
      <FusenDiv2 id="hidden-fusen-text"></FusenDiv2>
    </HiddenFusenDiv>
  );
};

const getHiddenFusen = (hiddenFusen?: HTMLDivElement) => {
  if (hiddenFusen === undefined) {
    return document.getElementById("hidden-fusen") as HTMLDivElement;
  }
  return hiddenFusen;
};

export const adjustFontSize = (
  text: string,
  testHiddenFusen?: HTMLDivElement
): number => {
  if (cache[text] !== undefined && testHiddenFusen !== undefined) {
    return cache[text];
  }
  const x = getHiddenFusen(testHiddenFusen);
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
  return cache[text];
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
