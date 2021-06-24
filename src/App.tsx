import React, { useEffect, useRef, useState } from "react";
import "./App.css";
const INITIAL = 128;
const cache = { "": INITIAL } as { [key: string]: number };
// @ts-ignore
window.adjust = () => {
  Array.from(document.getElementsByClassName("fusen")).forEach((_x) => {
    const x = _x as HTMLDivElement;
    console.log(x.innerText, x.scrollHeight, cache[x.innerText]);
    if (cache[x.innerText] === undefined) {
      cache[x.innerText] = INITIAL;
    }
    // let left = 1;
    // let right = INITIAL;
    // let current = INITIAL;
    // let step = INITIAL / 2;
    // while (true) {
    //   if (x.scrollHeight > 100) {
    //     cache[x.innerText] -= step;

    // }
    while (true) {
      if (x.scrollHeight > 100) {
        cache[x.innerText] -= 1;
        x.style.fontSize = cache[x.innerText] + "px";
        continue;
      } else if (x.scrollHeight < 100) {
        cache[x.innerText] += 1;
        x.style.fontSize = cache[x.innerText] + "px";
        continue;
      }
      break;
    }
    if (x.style.fontSize === "0px") {
      x.style.fontSize = "1px";
    }
  });
};

type Props = {
  text: string;
};

const Fusen: React.FC<Props> = ({ children, text }) => {
  const [fontSize, setFontSize] = useState(INITIAL);
  const ref = useRef(null);

  return (
    <div className="fusen" ref={ref} draggable={true}>
      <div>{text}</div>
    </div>
  );
};

function App() {
  let a = 1;
  let b = 1;
  const texts = [];
  for (let i = 0; i < 10; i++) {
    [a, b] = [b, a + b];
    texts.push("あ".repeat(a));
  }
  return (
    <div className="App">
      {texts.map((text) => (
        <Fusen text={text} />
      ))}
    </div>
  );
}

export default App;
