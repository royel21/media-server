const nameRegx = /^Title(:| :|) |Romanji: |Romaji: /gi;

export const getInfo = (text = "", info = {}, Name = "") => {
  if (!text) return;

  const parts = text.split("\n");
  let Title = "";

  for (let p of parts) {
    const date = new Date(p.match(/(\d+-\d+-\d+)|\d+\/\d+\/\d+/)?.[0]);
    if (date && date.toString() !== "Invalid Date") {
      info.ReleaseDate = date;
    }

    if (nameRegx.test(p)) {
      Title = p.replace(nameRegx, "");
    }

    let altNameRegx = /^(Japanese|Original) Title(:| :|) /i;
    if (altNameRegx.test(p)) {
      info.AltName = p.replace(altNameRegx, "").trim();
      if (/^-/.test(info.AltName)) info.AltName = "N/A";

      if (Title.trim()) {
        let title = Title.split(", ")
          .map((n) => n.trim())
          .filter((n) => n)
          .join("\n")
          .trim();
        info.AltName = `${info.AltName !== "N/A" ? info.AltName + "\n" : ""}${title}`;
        info.AltName = info.AltName.split("\n")
          .filter((a) => a !== Name)
          .join("\n");
      }
    }

    if (/Language( :|:|) /gi.test(p)) {
      info.Lang = p
        .split(":")
        .pop()
        .replace(/ \(Official\)/gi, "")
        .trim();
    }
    let devRegex = /^Developer( :|:|) /;
    if (devRegex.test(p)) {
      info.Company = p.replace(devRegex, "").split(", ")[0].trim();
    }

    if (/https:/.test(p)) {
      let Code = p
        .match(/(v|RJ|r|d_|app\/)\d+/i)?.[0]
        .replace(/app\//, "ST")
        .replace("d_", "D");
      if (Code) {
        if (!info.Codes) {
          info.Codes = Code;
        } else {
          info.AltName += " " + Code;
        }
      }
    }
  }
  return info;
};
