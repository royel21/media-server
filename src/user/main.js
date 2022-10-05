import "../global.css";
import "./index.css";
import App from "./App.svelte";

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
