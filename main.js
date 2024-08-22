const { app, Menu, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const os = require("node:os");
const fs = require("fs-extra");

try {
  app.allowRendererProcessReuse = false;
  app.commandLine.appendSwitch("--disable-http-cache");
  app.disableHardwareAcceleration();

  app.setPath("userData", path.resolve("./data"));

  let win = null;
  //Release the resource when the window is close+
  app.on("close", (e) => {
    win = null;
  });
  function createWin() {
    win = new BrowserWindow({
      title: "Test Manager Launcher",
      show: false,
      width: 1280,
      height: 720,
      webPreferences: {
        spellcheck: false,
      },
    });

    win.loadURL("http:\\localhost:8034");

    win.on("ready-to-show", () => {
      win.show();
    });

    win.on("close", (e) => {
      app.quit();
    });

    const selectionMenu = Menu.buildFromTemplate([{ role: "copy" }, { type: "separator" }, { role: "selectAll" }]);

    const inputMenu = Menu.buildFromTemplate([
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectAll" },
    ]);

    //This is used in mac for recreate the window
    app.on("activate", () => {
      try {
        if (win === null) {
          createWin();
        }
      } catch (error) {
        console.log(error);
      }
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    win.webContents.on("context-menu", (e, props) => {
      const { selectionText, isEditable } = props;
      if (isEditable) {
        inputMenu.popup(win);
      } else if (selectionText && selectionText.trim() !== "") {
        selectionMenu.popup(win);
      }
    });

    const customMenu = [
      {
        label: "File",
        submenu: [{ role: "quit" }],
      },
      {
        label: "Navigate",
        submenu: [
          {
            label: "Reload",
            click: () => {
              win.webContents.reload();
            },
          },
          {
            label: "Back",
            click: (props) => {
              win.webContents.navigationHistory.goBack();
            },
          },
          {
            label: "Forward",
            click: (props) => {
              win.webContents.navigationHistory.goForward();
            },
          },
        ],
      },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "togglefullscreen" },
          {
            label: "Always On Top",
            type: "checkbox",
            checked: true,
            click: (props) => {
              win.setAlwaysOnTop(props.checked);
            },
          },
          { type: "separator" },
        ],
      },
      {
        label: "Window",
        submenu: [{ role: "minimize" }],
      },
    ];

    win.setMenu(Menu.buildFromTemplate(customMenu));
    win.setAlwaysOnTop(true);

    //Dev Tools
    win.webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        // if (input.key === "F12" && isDevMode) {
        if (input.key === "F12") {
          win.toggleDevTools();
        }
        if (input.key === "F5") win.reload();
      }
    });
  }
  //Create the window when electron is ready
  app.on("ready", () => {
    createWin();
  });
} catch (error) {
  console.log(error);
  app.quit();
}
