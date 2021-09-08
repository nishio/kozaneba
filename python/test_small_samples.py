import kozaneba

import json


def test_small_sample1():
    ba = kozaneba.Ba()
    ba.add_kozane("1", [-100, 0])
    ba.add_kozane("2", [100, 0])
    ba.add_simple_arrow("1", "2")
    expected = json.load(open("small_sample1.json"))
    actual = json.loads(ba.to_json())
    assert expected == actual


def test_sample_group():
    ba = kozaneba.Ba()
    items = []
    items.append(ba.make_kozane("1", [-100, 0]))
    items.append(ba.make_kozane("2", [100, 0]))
    ba.add_group(items, [0, 0], "G1")
    expected = json.load(open("small_sample_group.json"))
    actual = json.loads(ba.to_json())
    assert expected == actual


def test_sample_group():
    ba = kozaneba.Ba()
    items = []
    items.append(ba.make_kozane("1", [-100, 0]))
    items.append(ba.make_kozane("2", [100, 0]))
    ba.add_group(items, [0, 0], "G1")
    ba.add_simple_arrow("1", "2")

    expected = json.load(open("small_sample_group_arrow.json"))
    actual = json.loads(ba.to_json())
    assert expected == actual


def save_json(ba, name):
    open(name, "w").write(ba.to_json())
