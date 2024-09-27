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
