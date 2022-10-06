import { updateToggleMenu } from "../../../ShareComponent/ToggleMenu";
import { showFileName } from "../pagesUtils";
let tStart, tEnd;
let point = {};
let touching = false;
let drag = false;
let moveY = { dis: 0, dir: 0 };
let moveX = { dis: 0, dir: 0 };

let controls = { nextPage: "", prevPage: "", nextFile: "", prevFile: "" };

export const onTouchStart = (e) => {
  touching = true;
  tStart = e.timeStamp;
  let { pageX, pageY } = (e.touches && e.touches[0]) || e;
  point = { x: pageX, y: pageY };
};

export const onTouchMove = (e) => {
  if (touching) {
    let { pageX, pageY } = e.touches[0];
    moveX.dir = pageX - point.x;
    moveY.dir = pageY - point.y;
    moveY.dis = Math.abs(moveY.dir);
    moveX.dis = Math.abs(moveX.dir);
    drag = true;
  }
};

export const onTouchEnd = (e) => {
  touching = false;
  let {
    file: { CurrentPos, Duration },
    webtoon,
    nextFile,
    nextPage,
    prevFile,
    prevPage,
    jumpTo,
    fullScreen,
  } = controls;
  if (!drag) {
    tEnd = e.timeStamp;
    let elapsed = tEnd - tStart;
    if (elapsed > 70) {
      let ww = window.innerWidth;
      let wh = window.innerHeight;
      // Top
      if (point.y < wh * 0.33) {
        if (point.x < ww * 0.33) {
          // top-left
          jumpTo(0);
        } else if (point.x < ww * 0.66) {
          // top-center
          showFileName();
        } else {
          jumpTo(Duration);
        }
        // Center
      } else if (point.y < wh * 0.8) {
        if (point.x < ww * 0.33) {
          //c enter-left
          nextPage();
        } else if (point.x < ww * 0.66) {
          // center-center
          fullScreen();
        } else {
          // center-right
          nextPage();
        }
        // 25% of the screen from the bottom
      } else {
        if (point.x < ww * 0.33) {
          // bottom-left
          prevFile();
        } else if (point.x < ww * 0.66) {
          // bottom-center
          updateToggleMenu();
        } else {
          // bottom-right
          nextFile();
        }
      }
    }
  } else {
    if (moveX.dis > 100) {
      if (moveX.dir > 0) {
        prevPage();
      } else {
        nextPage();
      }
    } else if (webtoon && moveY.dis > 250) {
      if (moveY.dir > 0 && CurrentPos === 0) {
        prevFile();
      } else if (CurrentPos === Duration - 1) {
        nextFile();
      }
    }
  }
  drag = false;
};

export default controls;
