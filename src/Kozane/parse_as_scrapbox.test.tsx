import { setGlobal } from "reactn";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { build_content, get_scarpbox_links } from "./parse_as_scrapbox";

const kozane = (text: string): TKozaneItem => ({
  type: "kozane",
  id: "k" as TItemId,
  text,
  position: [0, 0] as TWorldCoord,
  scale: 1,
});

describe("scrapbox rendering of kozane text", () => {
  beforeEach(() => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, scrapbox: "nishio" });
  });

  test.each(["code:foo.js", "table:bar"])(
    "%s does not throw (it is not a Scrapbox line)",
    (text) => {
      expect(build_content(kozane(text))).toBe(text);
      expect(get_scarpbox_links(kozane(text))).toEqual([]);
    }
  );

  test("a normal line is still parsed", () => {
    const content = build_content(kozane("see [Kozaneba]"));
    expect(Array.isArray(content)).toBe(true);
    expect(get_scarpbox_links(kozane("see [Kozaneba]"))).toHaveLength(1);
  });
});
