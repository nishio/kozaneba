import { get_one_line } from "./get_one_line";

export const multiline_to_lines = (multiline: string): string[] => {
  let line;
  const items: string[] = [];
  while (multiline !== "") {
    ({ multiline, line } = get_one_line(multiline));

    items.push(line);
  }
  return items;
};
