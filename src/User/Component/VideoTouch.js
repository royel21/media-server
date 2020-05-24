const initialData = {
    startX: 0,
    endPosX: 0,
    startY: 0,
    endY: 0,
    time: 0,
};

var startClick = 0;

var touching = false;
var gestureDir = 0;
var touchData = { ...initialData };

export const setGesture = (player) => {
    console.log(player);
    //   const [touchData, setTouchData] = useState(initialData);
    if (player) {
        player.ontouchstart = (e) => {
            touching = true;
            let time = e.timeStamp;

            if (e.type !== "mousedown") {
                let { pageX, pageY } = e.touches[0];
                touchData = { time, startX: pageX, startY: pageY };
            }
        };

        player.ontouchmove = (e) => {
            if (touching) {
                let { pageX, pageY } = e.touches[0];
                //   setTouchData({ ...touchData, endX: pageX, endY: pageY });
                let { startX, startY } = touchData;
                let deltaX = pageX - startX;
                let deltaY = pageY - startY;
                console.log(pageY);

                if (gestureDir === 0 && (deltaX > 10 || deltaX < -10)) {
                    gestureDir = 1;
                } else if (gestureDir === 0 && (deltaY > 10 || deltaY < -10)) {
                    gestureDir = 2;
                }

                if (gestureDir === 1 && !player.seeking) {
                    if (deltaX > 20 || deltaX < -20) {
                        let { duration, currentTime } = player;
                        let seek = currentTime + (deltaX > 0 ? 5 : -5);
                        player.currentTime =
                            seek < 0 ? 0 : seek > duration ? duration : seek;
                        touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
                    }
                } else if (gestureDir === 2) {
                    if (deltaY > 2 || deltaY < -2) {
                        let vol = player.volume + (deltaY < 0 ? 0.03 : -0.03);
                        player.volume = vol < 0 ? 0 : vol > 1 ? 1 : vol;
                        touchData = { time: e.timeStamp, startX: pageX, startY: pageY };
                    }
                }
            }
        };

        player.ontouchend = (e) => {
            touching = false;
            if (e.type === "touchend") {
            }
            // setTouchData(initialData);
            touchData = { initialData };
            gestureDir = 0;
        };
    }
};

export default useGesture;
