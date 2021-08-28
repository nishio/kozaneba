import { start_tutorial } from "../API/start_tutorial";

export const READONLY_MESSAGE = (
  <div>
    <p>
      This ba is for viewing only. You can edit it, but it will not be saved.
    </p>
    <p>
      Don't know how to use Kozaneba? Watch the{" "}
      <button onClick={start_tutorial}>tutorial</button>!
    </p>
  </div>
);
