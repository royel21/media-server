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

export function formatTime(time) {
  if (time === 0) return "00:00";

  let h = Math.floor(time / 3600);
  let min = Math.floor((time / 3600 - h) * 60);
  let sec = Math.floor(time % 60);
  return (h === 0 ? "" : h + ":") + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

export const getSecuences = (from, to) => {
  return [...Array(to - from + 1).keys()].map((a) => a + from);
};
