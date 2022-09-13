import App from "./App.svelte";

window.local = localStorage;

//LocalStorage
Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};
//get object fron LocalStorage
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

//Work like inckudes but with Case Insensitive
String.prototype.contains = function (val) {
  return this.toLocaleLowerCase().includes(val.toLocaleLowerCase());
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};

HTMLElement.prototype.on = function (event, listener) {
  this.addEventListener(event, listener);
};

HTMLElement.prototype.off = function (event, listener) {
  this.removeEventListener(event, listener);
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
