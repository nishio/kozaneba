import React, {
  createRef,
  DragEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
const INITIAL = 128;
const cache = { "": INITIAL } as { [key: string]: number };

const adjustFontSize = (text: string): number => {
  if (cache[text] !== undefined) {
    return cache[text];
  }
  const x = document.getElementById("hidden-fusen") as HTMLDivElement;
  (x.children[0] as HTMLDivElement).innerText = text;
  cache[text] = INITIAL;
  x.style.fontSize = cache[text] + "px";
  while (true) {
    if (x.scrollHeight > 100) {
      cache[text] -= 1;
      x.style.fontSize = cache[text] + "px";
      continue;
    } else if (x.scrollHeight < 100) {
      // cache[text] += 1;
      // x.style.fontSize = cache[text] + "px";
      // continue;
    }
    break;
  }
  if (cache[text] === 0) {
    cache[text] = 1;
    x.style.fontSize = cache[text] + "px";
  }
  return cache[text];
};
// @ts-ignore
window.adjust = () => {
  Array.from(document.getElementsByClassName("fusen")).forEach((_x) => {
    const x = _x as HTMLDivElement;
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
  id?: string;
};

const Fusen: React.FC<Props> = ({ children, text, id }) => {
  const [fontSize, setFontSize] = useState(1);
  console.log(text, fontSize);
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    setFontSize(adjustFontSize(text));
  }, [text]);

  const onDragEnd: DragEventHandler<HTMLDivElement> = (e) => {
    console.log(e);
    if (self.current !== null) {
      self.current.style.position = "absolute";
      self.current.style.left = e.clientX + "px";
      self.current.style.top = e.clientY + "px";
      e.preventDefault();
    }
  };

  return (
    <div
      className="fusen"
      ref={self}
      draggable={true}
      id={id}
      style={{ fontSize: fontSize }}
      onDragEnd={onDragEnd}
    >
      <div>{text}</div>
    </div>
  );
};

function App() {
  const [texts, setTexts] = useState([] as string[]);
  useEffect(() => {
    let a = 1;
    let b = 1;
    const texts = [];
    for (let i = 0; i < 10; i++) {
      [a, b] = [b, a + b];
      texts.push("あ".repeat(a));
    }
    setTexts(texts);
  }, []);
  return (
    <div className="App">
      {texts.map((text) => (
        <Fusen text={text} />
      ))}
      <div className="fusen" id="hidden-fusen">
        <div id="hidden-fusen-text"></div>
      </div>
    </div>
  );
}

export default App;
