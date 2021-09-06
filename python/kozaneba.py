
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
        return id

    def add_kozane(self, text, position):
        if text in self.ba["itemStore"]:
            id = self.create_new_itemid()
        else:
            id = text
        item = {"type": "kozane", "position": position,
                "id": id, "text": text, "scale": 1}
        self.ba["itemStore"][id] = item
        self.ba["drawOrder"].append(id)

    def add_arrow(self, items, heads):
        item = {"type": "line", "items": items, "heads": heads}
        self.ba["annotation"].append(item)

    def add_simple_arrow(self, frm, to):
        item = {"type": "line", "items": [frm, to], "heads": ["none", "arrow"]}
        self.ba["annotation"].append(item)

    def to_json(self):
        import json
        return json.dumps(self.ba, indent=2)


def small_sample():
    ba = Ba()
    ba.add_kozane("1", [-100, 0])
    ba.add_kozane("2", [100, 0])
    ba.add_simple_arrow("1", "2")
    print(ba.to_json())


def sample():
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
        if len(arrows) > 100:
            break

    import sys
    print(len(kozanes), len(arrows), file=sys.stderr)
    ba = Ba()
    for i, k in enumerate(sorted(kozanes)):
        ba.add_kozane(k, [200 * i, 0])
    for frm, to in arrows:
        ba.add_simple_arrow(frm, to)
    print(ba.to_json())


sample()
