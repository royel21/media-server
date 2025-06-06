import { isMobile } from "src/utils";

const initialData = {
  startX: 0,
  endPosX: 0,
  startY: 0,
  endY: 0,
  time: 0,
};

let touching = false;
let gestureDir = 0;
let touchData = { ...initialData };
let time = 0;
let gesture = false;

export const setGesture = (player, onPlay, mConfig) => {
  const container = player.parentElement;

  const onStart = (e) => {
    touching = true;
    time = e.timeStamp;
    let { pageX, pageY } = e.touches ? e.touches[0] : e;
    touchData = { time, startX: pageX, startY: pageY };
  };

  const onMove = (e) => {
    if (touching) {
      let { pageX, pageY } = e.touches ? e.touches[0] : e;
      let { startX, startY } = touchData;
      let deltaX = pageX - startX;
      let deltaY = pageY - startY;

      if (gestureDir === 0 && (deltaX > 10 || deltaX < -10)) {
        gestureDir = 1;
        gesture = true;
      } else if (gestureDir === 0 && (deltaY > 10 || deltaY < -10)) {
        gestureDir = 2;
        gesture = true;
      }

      if (gestureDir === 1 && !player.seeking) {
        if (deltaX > 20 || deltaX < -20) {
          let { duration, currentTime } = player;
          let seek = currentTime + (deltaX > 0 ? +mConfig.seekRate : -mConfig.seekRate);
          player.currentTime = seek < 0 ? 0 : seek > duration ? duration : seek;
          touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
          gesture = true;
        }
      } else if (gestureDir === 2) {
        if (deltaY > 2 || deltaY < -2) {
          let vol = player.volume + (deltaY < 0 ? 0.01 : -0.01);
          player.volume = vol < 0 ? 0 : vol > 1 ? 1 : vol;
          touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
          gesture = true;
        }
      }
    }
  };

  const onEnd = (e) => {
    if (touching) {
      touchData = { ...initialData };
      gestureDir = 0;
      if (!gesture) {
        onPlay(e);
      }
    }
    gesture = false;
    touching = false;
  };
  if (player) {
    container.addEventListener(isMobile() ? "touchstart" : "mousedown", onStart, { passive: true });
    container.addEventListener(isMobile() ? "touchmove" : "mousemove", onMove, { passive: true });
    document.body.addEventListener(isMobile() ? "touchend" : "mouseup", onEnd, { passive: true });
  }

  return () => {
    document.body.removeEventListener(isMobile() ? "touchend" : "mouseup", onEnd);
  };
};
