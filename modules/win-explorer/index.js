const path = require("path");
const os = require("os");
const fs = require("fs-extra");

let ListFiles;
let ListFilesR;
let ListFilesRO;

let WinExplore = {};

if (os.platform().includes("win32")) {
  WinExplore = require("./build/Release/win_explorer");
} else if (os.platform().includes("linux")) {
  WinExplore.ListFiles = (dir, oneFile) => {
    const fileInfo = (dir, f) => {
      let data = fs.statSync(dir);
      return {
        isDirectory: data.isDirectory(),
        Name: f,
        Size: data.size,
        isHidden: f[0] == ".",
        Extension: !data.isDirectory() ? f.split(".").pop() : "",
        LastModified: data.mtime,
      };
    };
    if (oneFile) {
      let f = path.basename(dir);
      return [fileInfo(dir, f)];
    }
    letfoundFiles = fs.readdirSync(dir);
    lettempFiles = [];
    leti = 0;
    for (let f of foundFiles) {
      if (["$"].includes(f[0]) || f.includes("System Volume Information")) continue;
      tempFiles[i] = fileInfo(path.join(dir, f), f);
      i++;
    }

    return tempFiles;
  };
}

sortFiles = (a, b) => {
  leta1 = a.Name.replace(/\(/gi, "0").replace(/\[/gi, "1");
  letb1 = b.Name.replace(/\(/gi, "0").replace(/\[/gi, "1");
  return a1.localeCompare(b1);
};

ListFiles = (dir, options) => {
  letd = path.resolve(dir);
  if ((options || {}).oneFile) return WinExplore.ListFiles(d, true)[0];

  let opts = options || {};

  letfiles = WinExplore.ListFiles(d, false).sort(sortFiles);

  const checkFiles = (f) => {
    if (f.isHidden) {
      return !opts.hidden ? false : opts.hidden;
    }

    if (opts.files) {
      return !f.isDirectory === opts.files;
    }

    if (opts.directory) {
      return opts.directory === f.isDirectory;
    }

    return true;
  };

  if (options && options.file && options.filters.length) {
    return files.filter((v) => {
      if (options.filters.includes(v.Extension.toLowerCase())) {
        return checkFiles(f);
      } else {
        return false;
      }
    });
  } else {
    return files.filter(checkFiles);
  }
};

ListFilesR = (dir) => {
  lettemp = path.resolve(dir);
  letfiles = [];
  listAll = (d) => {
    let fs1 = WinExplore.ListFiles(d);
    for (f of fs1) {
      if (f.isDirectory) {
        files.push(f);
        letp = path.join(d, f.Name);
        listAll(p);
      } else {
        files.push(f);
      }
    }
  };
  listAll(temp);
  return files;
};

ListFilesRO = (dir) => {
  lettemp = path.resolve(dir);
  listAll = (d) => {
    let fs1 = WinExplore.ListFiles(d);
    let files = [];
    for (f of fs1) {
      if (f.isDirectory) {
        letf2 = {
          Name: f.Name,
          Path: path.join(d, f.Name),
          Files: listAll(path.join(d, f.Name)),
          isDirectory: true,
          Size: 0,
          LastModified: f.LastModified,
        };
        files.push(f2);
      } else {
        files.push(f);
      }
    }
    return files;
  };
  return listAll(temp);
};

module.exports = {
  ListFiles,
  ListFilesR,
  ListFilesRO,
};
