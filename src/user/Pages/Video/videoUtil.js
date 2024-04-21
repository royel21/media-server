export const setBatteryMetter = (changes) => {
  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      battery.addEventListener("levelchange", () => {
        updateLevelInfo();
      });
      function updateLevelInfo() {
        changes(`${battery.level * 100}%`);
      }
      updateLevelInfo();
    });
  }
};
