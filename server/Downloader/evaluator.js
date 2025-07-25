export const evaluetePage = async (query) => {
  const cleanNameRegx =
    /18\+|\nEND| Webtoon|ONGOING|ON-GOING|NEW|HOT\n|manga|\nNew shoujo Manhwa| – Mangagreat| - mangagreat| Manga| Comics$|^Hot /g;

  let originalName = document.querySelector(query.Title).textContent.replace(cleanNameRegx, "").trim();

  let Name = originalName
    .replace(/(\.)+$| \$|\/|\|/, "")
    .replace(/:|\?|\*|<|>|"|^,|#/gi, "")
    .replace(/’/g, "'")
    .replace("–", "-")
    .replace(/ (\(|\[)official( \& Uncensored|)(\)|\])$/i, "")
    .replace(/( )+/g, " ")
    .trim();
  Name = await window.capitalize(Name);

  //get Description
  let Description = document.querySelector(query.Desc)?.textContent.trim();
  //load all chapter
  let as = [...document.querySelectorAll(query.Chapters)];

  /**********************Format Chapters Name************************* */

  let maxNum = 0;
  as.forEach((a) => {
    try {
      let num = +a.textContent.match(/\d+/)[0];
      if (maxNum < num) {
        maxNum = num;
      }
    } catch (error) {}
  });

  const padding = maxNum > 950 ? 4 : 3;

  const nameRegex = new RegExp(` - ${Name}`, "i");

  let data = as
    .map((a) => {
      let fileName = (a.querySelector("strong,b,span,p") || a).textContent?.trim().replace(/\n.*$|\nNEW/gi, "");

      fileName = fileName
        .trim()
        .replace(nameRegex, "")
        .replace(/\||\/|:|\?|\^|"|\*|<|>|\t|\n|\(|\)|\[|\]|\n/gi, "")
        .replace(/ - (\d+-)+eng-li/gi, "")
        .replaceAll(/^(chapter|chap|ch|vol)(-|\.)/gi, "")
        .replaceAll(/( | - )(Chapter|Chap|ch|Volume|vol|version)(. |.| )(\d+\.\d+|\d+)/gi, "")
        .replace(/ - (\(|)(fixed)(\)|)|Ver\. (α|\d+|)|(extra-|)lewd edit|.rar/gi, "")
        .replace(/^(Chapter|chap|chvol|)(-| )/i, "")
        .replace(".", "-")
        .replace(/(\.)+$/, "")
        .replace(/-6|-7/, "-5");
      let n = fileName.match(/\d+/);
      if (n) {
        n = n[0];
        fileName = fileName.replace(n, n.padStart(padding, "0"));
      }

      if (/^Tales Of Demons/i.test(Name)) {
        fileName = fileName.replace("-6", "-5");
        fileName = fileName.replace("-1", "");
      }

      return { name: fileName.trim(), url: a.href.replace(/-page-\d+/gi, "") };
    })
    .filter((a) => {
      let noAllowed =
        /chapter(_| |-)coming|Not worth reading|Prologue|Coming(_| |-)soon|Novel Promotion|Promo|announcement|Delay Notice$|^000(-| |(-| )Prologue|$)|^000( | -|0|$)/i;
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

  const genres = Genres.replace("Live Action", "")
    .split(",")
    .filter((g) => g)
    .map((d) => d.trim());
  //Statuc check
  let Status = [...document.querySelectorAll(query.Status)].find((t) => /completed|finished/gi.test(t?.textContent))
    ? 1
    : 0;

  let AltName = "";
  const authorRegex = /author((\(|)s(\)|)|)( |)(:|)( |)/i;
  let Author = "";
  for (let item of document.querySelectorAll(query.AltTitle)) {
    let text = item?.textContent;
    if (text && /Alternative/i.test(text)) {
      AltName = window.capitalize(
        text
          .replace(/:|\t|\n|\r/gi, "")
          .replace(/Alternative/i, "")
          .replaceAll(/’/g, "'")
          .trim()
      );
    }
    if (authorRegex.test(text) && !/updating|Desconocido/i.test(text)) {
      Author = text.replace(authorRegex, "").replace("Type ", "").trim();
    }

    if (/manhwa|manhua/i.test(text)) {
      genres.push("Manhwa");
    }
  }

  Genres = genres.sort().join(",");

  data = data.filter((d) => d);

  return { Name, data, poster, AltName, Description, Genres, Status, Author, maxNum };
};

//******************************Adult Section******************************************************/

export const adultEvalPage = async (query) => {
  let title = document.querySelector(query.Title).innerText.trim();
  let Name = title
    .replace("( Renta black and white comic Version)", "")
    .replace(/:|\?|\*|<|>|"| Webtoon| \(Acera\)\n|\n|\t|“|^,|\//gi, "")
    .replace(/(\.)+$/, "")
    .replace(/”( |)/g, ", ")
    .replace(/^(18\+|(ENDED|END)(\.|)+|ONGOING|ON GOING|ON-GOING|HOT|NEW)/, "")
    .replace(/’/g, "'")
    .replace(/ (\(|\[)official( \& Uncensored|)(\)|\])$/i, "")
    .replace(/( )+/g, " ");
  Name = Name.trim()
    .replace(/,$/, "")
    .replace(/ – (ENG|RAW)| raw$| manhwa Raw$/i, "");

  const paras = document.querySelectorAll(query.Desc);
  let Description = (paras[2] || paras[1] || paras[0] || "").innerText?.replace(/You are reading .*\\n\\n\\n/g, "");

  if (query.Name.includes("m440.in")) {
    while (document.querySelector("ul .caret")) {
      document.querySelector("ul .caret")?.parentElement?.onclick();
    }
  }

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

  const formatGenres = (text, extra = []) => {
    if (text === "N/A" || !text) return text || "";
    let genres = new Set(extra);
    const raw = / raw/i.test(title) || query.link.Raw ? "Raw" : "";
    let parts = [];

    if (/\/|,|\n/g.test(text)) {
      parts = text.replace(/\/|\n/g, ",").split(/,/g);
    } else {
      parts = text.split(/(  )+/g);
    }
    [raw, ...parts].forEach((d) => {
      if (d.trim() && !/Adulto|Full Color/i.test(d)) {
        genres.add(d.replace(/\((W|M|G|B|ML|Kid)\)/, "").trim());
      }
    });
    return window.capitalize([...genres].sort().join(", "));
  };

  const getAltName = (text) => {
    text = text
      .trim()
      .split("/")
      .filter((p) => p.trim())
      .map((p) => p.trim())
      .join("; ");
    return window.capitalize(
      text
        .replace(/:|\t|\n|\r/gi, "")
        .replace(/(Alternative|Other name|Nombres)( |)(:|)/i, "")
        .replaceAll(/’/g, "'")
        .replace(/ ; |( |)\/( |) /g, "; ")
        .replace(/',|’,/g, "'")
        .trim()
    );
  };

  let Genres = "";
  let AltName = "";
  const genreRegex = /genre((\(|)(s|)(\)|( |):(\n|)|))|Género(( |):|)/gi;
  const authorRegex = /(author|Autor)((\(|)s(\)|)|)( |)(:|)( |)/i;
  const year = /Year of Release|Year|Release/i;
  let Author = "";
  let items = document.querySelectorAll(query.AltTitle);
  let EmissionDate;
  if (items.length > 1) {
    for (let item of items) {
      let text = item?.textContent.trim();
      if (text) {
        if (/Alternative|Nombres|Other name/i.test(text)) {
          AltName = getAltName(text || "");
        }

        if (authorRegex.test(text) && !/known|updating|Desconocido/i.test(text)) {
          Author = text
            .replace(authorRegex, "")
            .split(/;|\/|,/)
            .map((a) => a.trim())
            .filter((a) => a)
            .join(", ");
        }

        if (/Artists|Artista/i.test(text)) {
          text = text
            .replace(/(Artists|Artista)(\:|)/, "")
            .split(/;|\/|,/)
            .filter((a) => a)
            .map((a) => a.trim());
          Author = [...Author.split(", "), ...text].join(", ");
        }

        if (genreRegex.test(text)) {
          Genres = formatGenres(text.replace(genreRegex, "").trim());
        }

        if (year.test(text)) {
          const found = text.replace(year, "").trim();
          if (/^\d+$/.test(found)) {
            EmissionDate = `1/1/${+found}`;
          }
        }

        if (/manhwa|manhua/i.test(text)) {
          Genres = formatGenres(Genres, ["Manhwa"]);
        }
      }
    }
  } else {
    AltName = AltName = getAltName(items[0]?.textContent || "");
  }

  if (Genres === "") {
    Genres = formatGenres(document.querySelector(query.Genres)?.textContent.replace(genreRegex, "").trim() || "");
  }

  let as = [...document.querySelectorAll(query.Chapters)];

  let maxNum = 0;
  as.forEach((a) => {
    try {
      let num = +(a.querySelector("strong,b,san") || a).textContent.match(/\d+/)[0];
      if (maxNum < num) {
        maxNum = num;
      }
    } catch (error) {}
  });

  const padding = maxNum > 950 ? 4 : 3;

  let data = [];
  as.reverse().forEach((a, i) => {
    let text = (a.querySelector("strong,b,san,.chapter-name") || a).textContent?.trim();

    let fileName = text
      .replace("  ", " ")
      .trim()
      .replace(
        /^ |vol.\d+ |volume \d+ |season \d+|(chapter|chap|ch|Capítulo|Episodio|episode|part|oneshot)( | - |-|\.)|\||\/|:|\?|\^|"|\*|<|>|\t|\n/gi,
        ""
      )
      .replaceAll("🌟", "")
      .replace(/(\.)+$/, "")
      .replace(/\./gi, "-")
      .replace(/( )+/g, " ")
      .replace(/^-( |)/, "")
      .trim();

    if (location.href.includes("bato.to") && /R15|Prologue/i.test(fileName)) return;

    if (/^Tales Of Demons/i.test(Name)) {
      fileName = fileName.replace("-6", "-5");
      fileName = fileName.replace("-1", "");
    }

    const season = text.match(/^Season \d+/i);
    if (season) {
      fileName = fileName + " " + season[0];
    }

    if (!/^\d+/i.test(fileName) && a.closest("li")?.textContent.match(/\d+(.\d+|)/)) {
      const fnum = a.closest("li")?.textContent.match(/\d+(.\d+|)/);
      if (fnum) {
        fileName = fnum[0] + " " + fileName;
      }
    } else if (!/^\d+/i.test(fileName)) {
      // if name is extra and don't start with number
      fileName = `${i} ${fileName}`;
    }

    let n = fileName.match(/\d+/);
    if (n) {
      n = n[0];
      fileName = fileName.replace(n, n.padStart(padding, "0"));
    }

    if (/ raw$/i.test(title) || Genres?.includes("Raw")) {
      if (!fileName.includes(" raw")) fileName = fileName + " raw";
    }

    const endRegex = / (- |-|)(\[|)end(\]|)/gi;

    if (i === as.length - 1 && endRegex.test(text)) {
      fileName = fileName.replace(endRegex, "") + " End";
    }

    if (data.find((f) => f.name === fileName) && /volume \d+/i.test(text)) {
      fileName = (data.length + 1).toString().padStart(padding, "0");
    }

    data.push({ name: fileName.trim(), url: a.href, n });
  });

  data = data.reverse().filter((a) => {
    if (!/^000(-| |(-| )Prologue|$)/gi.test(a.name)) {
      if (/ raw/i.test(a.name)) {
        return query.Raw;
      }
      return true;
    }
    return false;
  });

  if (query.Name.includes("m440.in")) {
    [...document.querySelectorAll(".dl-horizontal dt")].forEach((el) => {
      let content = el.nextElementSibling;
      let tag = el.textContent?.trim();
      if (tag && content) {
        if (tag.includes("Nombres")) {
          AltName = content.textContent;
        } else if (tag.includes("Género")) {
          Genres = formatGenres(content.textContent.replace(genreRegex, ""));
        } else if (tag.includes("Autor")) {
          Author = content.textContent
            .trim()
            .split(",")
            .map((t) => t.trim())
            .join(", ");
        }
      }
    });
  }

  let Status = /\nEnd\n|End\n/gi.test(title) || data.find((d) => / \[end\]$| end$| fin$/i.test(d.name)) ? 1 : 0;
  if (!Status) {
    Status = /completed|finished/gi.test(document.querySelector(query.Status)?.textContent || "") ? 1 : 0;
  }

  let Unc = /Uncensored/i.test(title);
  if (Unc) {
    for (let d of data) {
      d.name = d.name + " unc";
    }
  }

  Name = Name.replace(/^ON-GOING|^(18\+|(ENDED|END)(\.|)+|ONGOING|ON GOING|HOT|NEW)/i, "");

  return { Name, data, poster, Description, Status, posterData, Genres, AltName, title, Author, EmissionDate };
};

export const evaleLinks = async (query) => {
  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  if (query.Name.includes("kaliscan")) {
    for (let index = 0; index < 3; index++) {
      await delay(2000);
      let divs = document.querySelectorAll(".chapter-image");
      for (let div of divs) {
        div?.scrollIntoView();
        await delay(query.Delay);
      }
    }
  } else {
    let imgs = document.querySelectorAll(query.Imgs);
    for (let img of imgs) {
      img?.scrollIntoView();
      await delay(query.Delay);
    }
  }

  let data = [];
  let imgs = document.querySelectorAll(query.Imgs);

  if (query.Name.includes("mangas.in")) {
    for (let img of imgs) {
      while (/aHR0cHMl|loading.gif/.test(img.src)) {
        img?.scrollIntoView();
        await delay(100);
      }
    }
  }

  for (let img of imgs) {
    img?.scrollIntoView();
    await delay(query.Delay);
  }

  for (let img of imgs) {
    img?.scrollIntoView();
    const { src, dataset } = img;
    let nSrc = (dataset.lazySrc || dataset.src || dataset.lzlSrc || src)?.trim();

    if (/\.(ico|svg|com$)/.test(nSrc)) continue;

    if (location.href.includes("mangaclash")) {
      if (nSrc.includes("mangaclash")) {
        data.push(nSrc);
      }
    } else if (query.Name.includes("mangas.in")) {
      data.push(src);
    } else {
      data.push(nSrc);
    }
  }
  return data;
};
