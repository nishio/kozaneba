import React from "react";
import { act, render } from "@testing-library/react";
import { setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";

const save = vi.fn();
let physics_on = false;
vi.mock("../Cloud/save", () => ({ save: () => save() }));
vi.mock("../Physics/physics", () => ({ is_physics_on: () => physics_on }));
vi.mock("../utils/can_write", () => ({
  can_write: () => true,
  is_cloud: () => true,
}));

const { LocalChangeWatcher } = await import("./LocalChangeWatcher");
const { mark_local_changed } = await import("../utils/mark_local_changed");

const edit = async () => {
  await act(async () => {
    mark_local_changed();
    // mark_local_changed uses Date.now() for last_updated
    await new Promise((r) => setTimeout(r, 2));
  });
};

describe("LocalChangeWatcher", () => {
  beforeEach(() => {
    save.mockClear();
    physics_on = false;
    setGlobal({ ...INITIAL_GLOBAL_STATE, cloud_ba: "ba1" });
  });

  test("saves each edit", async () => {
    render(<LocalChangeWatcher />);
    await edit();
    await edit();
    expect(save).toHaveBeenCalledTimes(2);
  });

  test("an edit while physics is on does not block later saves", async () => {
    render(<LocalChangeWatcher />);
    physics_on = true;
    await edit();
    expect(save).toHaveBeenCalledTimes(0);
    physics_on = false;
    await edit();
    await edit();
    expect(save).toHaveBeenCalledTimes(2);
  });
});
