import { FusenItem } from "../Fusen/FusenItem";
import { updateGlobal } from "../Global/updateGlobal";

export const onAddFusens = () => {
  updateGlobal((g) => {
    const x = new FusenItem();
    x.text = "Foo";
    g.itemStore[x.id] = x;
    g.drawOrder.push(x.id);
    g.dialog = "";
  });
};
