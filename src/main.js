import App from "./App.svelte";

window.local = localStorage;

Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
  let value = this.getItem(key);
  if (value === "undefined") return {};
  try {
    value = JSON.parse(value);
  } catch (err) {
    console.log(err);
  }
  return value;
};

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("/service-worker.js");
    } catch (err) {
      console.log(err);
    }
  }
});

const app = new App({
  target: document.body,
});

export default app;
