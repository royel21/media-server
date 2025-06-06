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
export const setGesture = (player, onPlay, mConfig) => {
  if (player) {
    const onStart = (e) => {
      touching = true;
      time = e.timeStamp;

      if (e.type !== "mousedown") {
        let { pageX, pageY } = e.touches[0];
        touchData = { time, startX: pageX, startY: pageY };
      } else if (e.which === 1) {
        onPlay();
      }
    };

    const onMove = (e) => {
      if (touching) {
        let { pageX, pageY } = e.touches[0];
        let { startX, startY } = touchData;
        let deltaX = pageX - startX;
        let deltaY = pageY - startY;

        if (gestureDir === 0 && (deltaX > 10 || deltaX < -10)) {
          gestureDir = 1;
        } else if (gestureDir === 0 && (deltaY > 10 || deltaY < -10)) {
          gestureDir = 2;
        }

        if (gestureDir === 1 && !player.seeking) {
          if (deltaX > 20 || deltaX < -20) {
            let { duration, currentTime } = player;
            let seek = currentTime + (deltaX > 0 ? +mConfig.seekRate : -mConfig.seekRate);
            player.currentTime = seek < 0 ? 0 : seek > duration ? duration : seek;
            touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
          }
        } else if (gestureDir === 2) {
          if (deltaY > 2 || deltaY < -2) {
            let vol = player.volume + (deltaY < 0 ? 0.01 : -0.01);
            player.volume = vol < 0 ? 0 : vol > 1 ? 1 : vol;
            touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
          }
        }
      }
    };

    const onEnd = (e) => {
      touching = false;
      touchData = { ...initialData };
      gestureDir = 0;
      if (e.timeStamp - time < 110) {
        onPlay();
      }
    };

    player.addEventListener("mousedown", onStart, { passive: true });
    player.addEventListener("touchstart", onStart, { passive: true });
    player.addEventListener("touchmove", onMove, { passive: true });
    player.addEventListener("mouseup", onEnd, { passive: true });
    player.addEventListener("touchend", onEnd, { passive: true });
  }
};
