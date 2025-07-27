import { getEvent } from "@share/utils";

let drag = false;
let touching = false;
let point = {};

let moveY = {
  //Distance
  dis: 0,
  //Direction
  dir: 0,
};
let moveX = {
  //Distance
  dis: 0,
  //Direction
  dir: 0,
};

let defaultEvents = {
  topLeft: () => {},
  topCenter: () => {},
  topRight: () => {},
  centerLeft: () => {},
  center: () => {},
  centerRight: () => {},
  bottomLeft: () => {},
  bottomCenter: () => {},
  bottomRight: () => {},
  dragLeftToRight: () => {},
  dragRightToLeft: () => {},
};

export const events = { ...defaultEvents };

export const onStart = (e) => {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  let { pageX, pageY } = getEvent(e);
  point = { x: pageX - left, y: pageY - top };
  touching = true;
};

export const onMove = (e) => {
  if (touching) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    let { pageX, pageY } = getEvent(e);
    moveX.dir = pageX - left - point.x;
    moveY.dir = pageY - top - point.y;
    moveY.dis = Math.abs(moveY.dir);
    moveX.dis = Math.abs(moveX.dir);

    drag = true;
  }
};

export const onEnd = ({ currentTarget }) => {
  touching = false;
  if (drag) {
    if (moveX.dis > 100) {
      if (moveX.dir > 0) {
        events.dragLeftToRight();
      } else {
        events.dragRightToLeft();
      }
    }
  } else {
    let ww = currentTarget.offsetWidth;
    let wh = currentTarget.offsetHeight;

    if (point.y < wh * 0.33) {
      if (point.x < ww * 0.33) {
        // top-left
        events.topLeft();
      } else if (point.x < ww * 0.66) {
        // top-center
        events.topCenter();
      } else {
        events.topRight();
      }
      // Center
    } else if (point.y < wh * 0.66) {
      if (point.x < ww * 0.33) {
        //center-left
        events.centerLeft();
      } else if (point.x < ww * 0.66) {
        events.center();
        // center-center
      } else {
        events.centerRight();
        // center-right
      }
      // 25% of the screen from the bottom
    } else {
      if (point.x < ww * 0.33) {
        events.bottomLeft();
        // bottom-left
      } else if (point.x < ww * 0.66) {
        // bottom-center
        events.bottomCenter();
      } else {
        // bottom-right
        events.bottomRight();
      }
    }
  }
  drag = false;
};

// Region is divide in 9 from top left
// and drag are from right to left and left to right
