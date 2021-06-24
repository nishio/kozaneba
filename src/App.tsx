import React from "react";
import "./App.css";
const cache = { "": 120 } as { [key: string]: number };
// @ts-ignore
window.adjust = () => {
  Array.from(document.getElementsByClassName("fusen")).forEach((_x) => {
    const x = _x as HTMLDivElement;
    console.log(x.innerText, x.scrollHeight, cache[x.innerText]);
    if (cache[x.innerText] === undefined) {
      cache[x.innerText] = 120;
    }
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
  });
};
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="fusen" id="test">
          a
        </div>
        <p></p>
        <div className="fusen" id="test">
          aa
        </div>
        <p></p>
        <div className="fusen" id="test">
          aaa
        </div>
        <p></p>
        <div className="fusen" id="test">
          あ
        </div>
        <p></p>
        <div className="fusen" id="test">
          ああ
        </div>
        <p></p>
        <div className="fusen" id="test">
          <span>あああ</span>
        </div>
        <p></p>
        <div className="fusen" id="test">
          aaaaaaaaaaaaaaaaaaaaa
        </div>
        <p></p>
        <div className="fusen" id="test">
          aaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaa
        </div>
      </header>
    </div>
  );
}

export default App;
