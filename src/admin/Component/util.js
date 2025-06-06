const getImage = async () => {
  const item_list = await navigator.clipboard?.read();
  for (const item of item_list || []) {
    const image_type = item.types.find((type) => /image\//.test(type));
    if (image_type) {
      return item.getType(image_type);
    }
  }
};

export const handlerPaste = async (item, key, sept, ref) => {
  try {
    let image = await getImage();
    if (image) {
      item.file = image;
      ref.value = "";
      item.url = "";
      return ref.dispatchEvent(new Event("change"));
    }

    let text = await navigator.clipboard?.readText();
    if (text) {
      text = text.trim();
      if (item[key] && sept) {
        if (!item[key].includes(text)) {
          item[key] = item[key] + sept + text;
        }
      } else {
        item[key] = text;
      }
      ref.value = item[key];
      return ref.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    console.log(error);
  }
};

export const formatSize = (size) => (size / 1024 / 1024 / 1024).toFixed(3);

const toLowerList = /^(For|No|It|Of|And|In|X|Du|Or|A|Wa|wo|na|to|ni|de|o|by)$/i;

export const capitalize = (val, splitter = " ", Preserve = true) => {
  let words = val.replace(/( )+/g, " ").split(splitter);

  if (words.length > 1) {
    for (let i = 0; i < words.length; i++) {
      if (i == 0 && words[i].length === 1) {
        words[i] = words[i].toUpperCase();
        continue;
      }

      if (toLowerList.test(words[i])) {
        words[i] = words[i].toLowerCase();
        continue;
      }

      if (words[i].length > 1) {
        let word = words[i];
        //find first letter index
        const index = word.split("").findIndex((c) => /[a-z]/i.test(c));
        if (index > -1) {
          words[i] = word.slice(0, index + 1).toUpperCase();
          if (Preserve) {
            words[i] += word.slice(index + 1);
          } else {
            words[i] += word.slice(index + 1).toLowerCase();
          }
        }
      }
    }
  }

  let result = words.join(splitter).trim();

  const found = result.match(/(\.|:|,) [a-z] /gi);
  if (found) {
    result = result.replace(found[0], found[0].toUpperCase());
  }

  return result;
};

export function formatTime(time) {
  if (time === 0) return "00:00";

  let h = Math.floor(time / 3600);
  let min = Math.floor((time / 3600 - h) * 60);
  let sec = Math.floor(time % 60);
  return (h === 0 ? "" : h + ":") + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}
