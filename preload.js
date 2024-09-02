window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const uname = document.querySelector('input[name="username"');
    if (uname) {
      uname.value = "";
      uname.dispatchEvent(new Event("change"));
    }
    const upass = document.querySelector('input[name="password"');
    if (upass) {
      upass.value = "";
      upass.dispatchEvent(new Event("change"));
    }
  }, 400);
});
