import "../global.css";
import "./index.css";

//Work like inckudes but with Case Insensitive
String.prototype.contains = function (val) {
  return this.toLocaleLowerCase().includes(val.toLocaleLowerCase());
};

import App from "./App.svelte";

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
