def debug(*x, msg=""):
    import sys
    print(msg, *x, file=sys.stderr)


class Ba:
    def __init__(self):
        self.ba = {
            "itemStore": {},
            "drawOrder": [],
            "annotation": [],
            "format": "Kozaneba",
            "version": 4
        }
        self.id = 0

    def create_new_itemid(self):
        id = str(self.id)
        while id in self.ba["itemStore"]:
            self.id += 1
            id = str(self.id)
        print("id", id)
        return id

    def add_kozane(self, text, position):
        self.add_item(self.make_kozane(text, position))

    def add_item(self, item, on_toplevel=True):
        id = item["id"]
        self.ba["itemStore"][id] = item
        if on_toplevel:
            self.ba["drawOrder"].append(id)
        return id

    def make_kozane(self, text, position):
        id = self.make_id(text)
        item = {"type": "kozane", "position": position,
                "id": id, "text": text, "scale": 1}
        return item

    def make_id(self, text):
        if text == "" or text in self.ba["itemStore"]:
            return self.create_new_itemid()
        return text

    def make_group(self, items, position, text=""):
        item_id = self.make_id(text)
        item_ids = []
        for x in items:
            item_ids.append(self.add_item(x, on_toplevel=False))
        item = {
            "type": "group", "position": position,
            "items": item_ids, "isOpen": False,
            "id": item_id, "text": text, "scale": 1}
        return item

    def add_group(self, items, position, text=""):
        self.add_item(self.make_group(items, position, text))

    def add_arrow(self, items, heads):
        item = {"type": "line", "items": items, "heads": heads}
        self.ba["annotation"].append(item)

    def add_simple_arrow(self, frm, to):
        "add simple arrow from `frm` to `to"
        item = {"type": "line", "items": [frm, to], "heads": ["none", "arrow"]}
        self.ba["annotation"].append(item)

    def to_json(self):
        import json
        return json.dumps(self.ba, indent=2)


def small_sample_group():
    ba = Ba()
    items = []
    items.append(ba.make_kozane("1", [-100, 0]))
    items.append(ba.make_kozane("2", [100, 0]))
    ba.add_group(items, [0, 0], "G1")
    print(ba.to_json())


def sample1():
    import os
    import re
    kozanes = set()
    arrows = []
    for path, dirs, files in os.walk("../src"):
        for f in files:
            fp = os.path.join(path, f)
            frm = fp.replace("../src/", "")
            frm = frm.replace(".tsx", "")
            frm = frm.replace(".ts", "")
            data = open(fp).read()
            imports = re.findall(r'from "(\.[^"]*)"', data)
            for f in imports:
                fp = os.path.normpath(os.path.join(path, f))
                to = fp.replace("../src/", "")
                arrows.append((frm, to))
                kozanes.add(to)
            kozanes.add(frm)
        # if len(arrows) > 100:
        #     break

    import sys
    print(len(kozanes), len(arrows), file=sys.stderr)
    ba = Ba()
    from math import sqrt
    W = int(sqrt(len(kozanes)))
    for i, k in enumerate(sorted(kozanes)):
        ba.add_kozane(k, [200 * (i % W), 200 * (i // W)])
    for frm, to in arrows:
        ba.add_simple_arrow(frm, to)
    print(ba.to_json())


def sample2():
    import os
    import re
    kozanes = set()
    arrows = []
    groups = {}

    ba = Ba()

    for path, dirs, files in os.walk("../src"):
        group_title = path.replace("../src/", "")
        items = []
        for d in dirs:
            items.append(os.path.join(group_title, d))

        group = ba.make_group(items, [0, 0], group_title)

        for f in files:
            if not (".tsx" in f):
                continue
            fp = os.path.join(path, f)
            data = open(fp).read()
            frm = fp.replace("../src/", "")
            frm = frm.replace(".tsx", "")
            frm = frm.replace(".ts", "")
            imports = re.findall(r'from "(\.[^"]*)"', data)
            for f in imports:
                fp = os.path.normpath(os.path.join(path, f))
                to = fp.replace("../src/", "")
                arrows.append((frm, to))
                kozanes.add(to)
            kozanes.add(frm)
            group.append(frm)

        group[group_title] = group

    ba = Ba()
    from math import sqrt
    W = int(sqrt(len(kozanes)))
    for i, k in enumerate(sorted(kozanes)):
        ba.add_kozane(k, [200 * (i % W), 200 * (i // W)])
    for frm, to in arrows:
        ba.add_simple_arrow(frm, to)
    # print(ba.to_json())


# sample2()
