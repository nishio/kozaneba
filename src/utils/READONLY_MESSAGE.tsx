import { start_tutorial } from "../API/start_tutorial";

export const READONLY_MESSAGE = (
  <div>
    <p>
      This ba is for viewing only. You can edit it, but it will not be saved.
    </p>
    <p>
      Don't know how to use Kozaneba?
      <button onClick={start_tutorial}>Watch the tutorial!</button>
    </p>
  </div>
);

export const ERROR_MESSAGE = (
  <div>
    <p>Error occured. Maybe you missed a copy?</p>
    <p>
      Don't know how to use Kozaneba?
      <button onClick={start_tutorial}>Watch the tutorial!</button>
    </p>
  </div>
);
