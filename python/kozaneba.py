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
        debug("id", id)
        return id

    # add_*: make item and add it on toplevel
    def add_kozane(self, text, position):
        self.add_item_on_toplevel(self.make_kozane(text, position))

    def add_item_on_toplevel(self, id):
        self.ba["drawOrder"].append(id)
        return id

    # make_*: create item and put it in itemStore
    def make_kozane(self, text, position):
        id = self.make_id(text)
        item = {"type": "kozane", "position": position,
                "id": id, "text": text, "scale": 1}
        self.ba["itemStore"][id] = item
        return id

    def make_id(self, text):
        if text == "" or text in self.ba["itemStore"]:
            return self.create_new_itemid()
        return text

    def make_group(self, items, position, text=""):
        id = self.make_id(text)
        item = {
            "type": "group", "position": position,
            "items": items, "isOpen": False,
            "id": id, "text": text, "scale": 1}
        self.ba["itemStore"][id] = item
        return id

    def add_group(self, items, position, text=""):
        self.add_item_on_toplevel(self.make_group(items, position, text))

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

    def align_square_all(self):
        self.align_square_items(self.ba["drawOrder"])

    def align_square_items(self, items, recursive=True):
        from math import sqrt, ceil
        W = ceil(sqrt(len(items)))
        for i, k in enumerate(items):
            item = self.ba["itemStore"][k]
            item["position"] = [200 * (i % W), 200 * (i // W)]
            if recursive:
                if item["type"] == "group":
                    self.align_square_items(item["items"])


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
    debug(len(kozanes), len(arrows))
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
        if group_title == "../src":
            group_title = ""
        items = []
        for d in dirs:
            items.append(os.path.join(group_title, d))

        for f in files:
            if not (".ts" in f):
                continue
            fp = os.path.join(path, f)
            data = open(fp).read()
            frm = fp.replace("../src/", "")
            frm = frm.replace(".tsx", "")
            frm = frm.replace(".ts", "")
            items.append(frm)
            ba.make_kozane(frm, [0, 0])
            debug(frm, msg=":frm")

            imports = re.findall(r'from "(\.[^"]*)"', data)
            for f in imports:
                fp = os.path.normpath(os.path.join(path, f))
                to = fp.replace("../src/", "")
                ba.add_simple_arrow(frm, to)

        ba.make_group(items, [0, 0], group_title)

    ba.add_item_on_toplevel("0")
    ba.align_square_all()
    print(ba.to_json())


sample2()
