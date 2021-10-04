import React from "react";
import { RTItem } from "./Global/TItem";
// import { render, screen } from "@testing-library/react";
// import App from "./App";

test("main", () => {
  // RTItem.check({ type: "kozane", position: [], id: "A", text: "A" });
  const result = RTItem.validate({
    type: "kozane",
    position: [],
    id: "A",
    text: "A",
  });
  if (!result.success) {
    console.log(result.details);
  }
});
