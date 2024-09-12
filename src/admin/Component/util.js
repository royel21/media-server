const getImage = async () => {
  const item_list = await navigator.clipboard?.read();
  let image_type; // we will feed this later
  const item = item_list.find(
    (
      item // choose the one item holding our image
    ) =>
      item.types.some((type) => {
        // does this item have our type
        if (type.startsWith("image/")) {
          image_type = type; // store which kind of image type it is
          return true;
        }
      })
  );
  const file = item && (await item.getType(image_type));

  return file;
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
