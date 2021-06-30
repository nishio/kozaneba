import { setGlobal } from "reactn";

export const testFixture_ManyFusen = () => {
  const fusens = [];
  for (let x = -10; x < 11; x++) {
    for (let y = -10; y < 11; y++) {
      fusens.push({ text: `${x},${y}`, x: x * 200, y: y * 200 });
    }
  }
  setGlobal({ fusens });
};
