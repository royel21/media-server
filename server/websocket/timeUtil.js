export const formatTime = (time, sec) => {
  let h = Math.floor(time / 3600);
  let min = Math.floor((time / 3600 - h) * 60);
  let sec = Math.floor(time % 60);
  return (h == 0 ? "" : h + ":") + String(min).padStart(2, "0") + (sec ? ":" + String(sec).padStart(2, "0") : "");
};
