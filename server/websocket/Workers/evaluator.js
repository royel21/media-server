export const evaluetePage = (query) => {
  const capitalize = (val) => {
    let words = val.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
    }
    return words.join(" ");
  };

  const cleanNameRegx =
    /18\+|\nEND| Webtoon|ONGOING|NEW|HOT\n|manga|\nNew shoujo Manhwa| – Mangagreat| - mangagreat| Manga| Comics$|\[HOT\] BY ISEKAISCAN/g;

  let originalName = document.querySelector(query.Title).textContent.replace(cleanNameRegx, "").trim();

  let Name = originalName
    .replace(/(\.)+$| \$/, "")
    .replace(/:|\?|\*|<|>|"|^,/gi, "")
    .replace(/’/g, "'")
    .replace("–", "-")
    .replace(/( )+/g, " ")
    .trim();
  Name = capitalize(Name);

  //get Description
  let Description = document.querySelector(query.Desc)?.textContent.trim();
  //load all chapter
  let as = [...document.querySelectorAll(query.Chapters)];

  /**********************Format Chapters Name************************* */
  let chaps = [];
  as.forEach((a) => {
    try {
      let num = a.textContent.match(/\d+/)[0];
      if (!chaps.includes(num)) chaps.push(num);
    } catch (error) {}
  });
  const nameRegex = new RegExp(` - ${Name}`, "i");

  const padding = chaps.length > 999 ? 4 : 3;

  let data = as
    .map((a) => {
      let val = (a.querySelector("span") || a).textContent;

      val = val
        .trim()
        .replace(nameRegex, "")
        .replace(/\||\/|:|\?|\^|"|\*|<|>|\t|\n|\(|\)|\[|\]|\n/gi, "")
        .replace(/ - (\d+-)+eng-li/gi, "")
        .replaceAll(/^(chapter|chap|ch|vol)(-|\.)/gi, "")
        .replaceAll(/( | - )(Chapter|Chap|ch|Volume|vol|version)(. |.| )(\d+\.\d+|\d+)/gi, "")
        .replace(/ - (\(|)(fixed)(\)|)|Ver\. (α|\d+|)|(extra-|)lewd edit|.rar/gi, "")
        .replace(/^(Chapter|chap|chvol|)(-| )/i, "")
        .replace(".", "-")
        .replace(/(\.)+$/, "");
      let n = val.match(/\d+/);
      if (n) {
        n = n[0];
        val = val.replace(n, n.padStart(padding, "0"));
      }

      return { name: val, url: a.href.replace(/-page-\d+/gi, "") };
    })
    .filter((a) => {
      let noAllowed =
        /chapter(_| |-)coming|Not worth reading|Prologue|Coming(_| |-)soon|Novel Promotion|Promo|announcement|Delay Notice$|^000(-| |(-| )Prologue|$)|^0000/gi;
      return !noAllowed.test(a.name);
    });

  let img = document.querySelector(query.Cover);
  let poster = img && (img.dataset.src || img.dataset.lazySrc || img.dataset.srcset || img.src);

  let Genres =
    document
      .querySelector(query.Genres)
      ?.textContent.split("\n")
      .map((d) => d.trim())
      .filter((d) => d !== "" && d !== ",")
      .join(", ") || "";

  const genres = Genres.split(",").map((d) => d.trim());
  genres.sort();
  Genres = genres.join(", ");

  //Statuc check
  let Status = [...document.querySelectorAll(query.Status)].find((t) => /completed|finished/gi.test(t?.textContent))
    ? 1
    : 0;

  let AltName = "";
  for (let item of document.querySelectorAll(query.AltTitle)) {
    let text = item?.textContent;
    if (text && /Alternative/i.test(text)) {
      AltName = capitalize(
        text
          .replace(/:|\t|\n|\r/gi, "")
          .replace(/Alternative/i, "")
          .replaceAll(/’/g, "'")
          .trim()
      );
    }
  }
  data = data.filter((d) => d);

  return { Name, data, poster, AltName, Description, Genres, Status };
};

export const evaleLinks = async (query) => {
  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  let data = [];
  let imgs = document.querySelectorAll(query.Imgs);

  for (let img of imgs) {
    img?.scrollIntoView();
    await delay(/toonily/i.test(query.Name) ? 400 : 80);
    const { src, dataset } = img;
    let nSrc = (dataset.lazySrc || dataset.src || src)?.trim();

    if (nSrc.includes(".ico")) continue;

    if (location.href.includes("mangas.in")) {
      if (img.src.includes("loading.gif") && /jpg|png|webp/i.test(nSrc)) {
        data.push(nSrc);
      } else {
        while (img.src.includes("loading.gif")) {
          await delay(90);
        }
        data.push(img.src);
      }
    } else if (location.href.includes("mangaclash")) {
      if (nSrc.includes("mangaclash")) {
        data.push(nSrc);
      }
    } else {
      data.push(nSrc);
    }
  }
  return data;
};

//******************************Adult Section******************************************************/

export const adultEvalPage = async (query) => {
  const capitalize = (val) => {
    let words = val.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
    }
    return words.join(" ");
  };

  let title = document.querySelector(query.Title).innerText.trim();
  let Name = title
    .replace("( Renta black and white comic Version)", "")
    .replace(/:|\?|\*|<|>|"| Webtoon| \(Acera\)\n|\n|\t|“|^,/gi, "")
    .replace(/(\.)+$/, "")
    .replace(/”( |)/g, ", ")
    .replace(/^(18\+|(ENDED|END)(\.|)+|ONGOING|ON GOING|HOT|NEW)/, "")
    .replace(/’/g, "'")
    .replace(/( )+/g, " ");
  Name = Name.trim()
    .replace(/,$/, "")
    .replace(/ raw$| manhwa Raw$/i, "");

  const paras = document.querySelectorAll(query.Desc);
  let Description = (paras[2] || paras[1] || paras[0] || "").innerText?.replace(/You are reading .*\\n\\n\\n/g, "");

  if (query.Name.includes("mangas.in")) {
    while (document.querySelector("ul .caret")) {
      document.querySelector("ul .caret")?.parentElement?.onclick();
    }
  }
  let chaps = [...document.querySelectorAll(query.Chapters)];
  const padding = chaps.length > 999 ? 4 : 3;

  let data = chaps
    .map((a) => {
      let text = (
        a.querySelector("strong") ||
        a.querySelector("b") ||
        a.querySelector("span") ||
        a
      ).textContent?.trim();

      let fileName = text
        .replace("  ", " ")
        .trim()
        .replace(/( )+/g, " ")
        .replace(/^ |vol.\d+ |(chapter|chap|ch|Capítulo|Episodio)( | - |-)|\||\/|:|\?|\^|"|\*|<|>|\t|\n/gi, "")
        .replace(/(\.)+$/, "")
        .replace(/\./gi, "-");

      let n = fileName.match(/\d+/);
      if (n) {
        n = n[0];
        fileName = fileName.replace(n, n.padStart(padding, "0"));
      }

      if (/ raw$/i.test(title) || query.Raw) {
        fileName = fileName + " raw";
      }

      return { name: fileName, url: a.href, n };
    })
    .filter((a) => !/^000(-| |(-| )Prologue|$)/gi.test(a.name));

  let img = document.querySelector(query.Cover);
  let poster = "";
  if (img.tagName === "DIV") {
    let url = img.style.backgroundImage.match(/http.*(jpg|png|webp)/g);
    if (url) {
      poster = url[0];
    }
  } else if (img) {
    poster = img.srcset?.split(" ")[2] || img.dataset.src || img.dataset.srcset || img.src;
  }

  let posterData;
  try {
    const response = await fetch(poster);

    if (response.ok) {
      const resp = await response.blob();
      const reader = new FileReader();
      posterData = await new Promise((resolve) => {
        reader.addEventListener("loadend", () => resolve(reader.result));
        reader.readAsDataURL(resp);
      });
    }
  } catch (error) {}

  let Status = /\nEnd\n|End\n/gi.test(title) || data.find((d) => / \[end\]$| end$| fin$/i.test(d.name)) ? 1 : 0;
  if (!Status) {
    Status = /completed|finished/gi.test(document.querySelector(query.Status)?.textContent || "") ? 1 : 0;
  }

  const formatGenres = (text) => {
    if (text === "N/A") return text;

    let parts = [];

    if (text.includes(",")) {
      parts = text.split(/, /);
    } else {
      parts = text.split(/(  )+/);
    }
    parts = parts.map((d) => d.trim()).filter((d) => d);
    parts.sort();
    return capitalize(parts.join(", "));
  };

  let Genres = "";
  let AltName = "";
  let genreRegex = /(genre((\(|)(s|)(\)|)|)|Género)(:|)/i;
  for (let item of document.querySelectorAll(query.AltTitle)) {
    let text = item?.textContent.trim();
    if (text) {
      if (/Alternative|Nombres|Other name/i.test(text)) {
        AltName = capitalize(
          text
            .replace(/:|\t|\n|\r/gi, "")
            .replace(/(Alternative|Other name|Nombres)( |)(:|)/i, "")
            .replaceAll(/’/g, "'")
            .replace(/ ; |( |)\/( |) /g, "; ")
            .replace(/',|’,/g, "'")
            .trim()
        );
      }
      if (genreRegex.test(text)) {
        Genres = formatGenres(text.replace(genreRegex, "").trim());
      }
    }
  }

  if (location.href.includes("mangas.in")) {
    [...document.querySelectorAll(".dl-horizontal dt")].forEach((el) => {
      if (el.textContent?.includes("Nombres") && el.nextElementSibling) {
        AltName = el.nextElementSibling?.textContent;
      } else if (el.textContent?.includes("Género") && el.nextElementSibling) {
        Genres = formatGenres(el.nextElementSibling.textContent.replace(genreRegex, ""));
      }
    });

    data = data
      .reverse()
      .map((d, i) => {
        const num = d.name.match(/^\d+/);
        let nextN = `${i + 1}`.padStart(3, "0");

        if (!num || d.name !== nextN) {
          d.name = `${i + 1}`.padStart(3, "0") + " " + d.name;
        }
        return d;
      })
      .reverse();
  }

  return { Name, data, poster, Description, Status, posterData, Genres, AltName, title };
};
