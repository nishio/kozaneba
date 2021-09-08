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
