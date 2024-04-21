export const batteryState = { change: () => {} };

const setBatteryMetter = () => {
  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      battery.addEventListener("levelchange", () => {
        updateLevelInfo();
      });
      function updateLevelInfo() {
        batteryState.change(`${battery.level * 100}%`);
      }
      updateLevelInfo();
    });
  }
};
setBatteryMetter();
