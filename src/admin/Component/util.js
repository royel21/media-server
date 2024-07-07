export const handlerPaste = async (item, key, sept, ref) => {
  let text = await navigator.clipboard?.readText();
  if (text) {
    if (item[key] && sept) {
      if (!item[key].includes(text)) {
        item[key] = item[key] + sept + text;
      }
    } else {
      item[key] = text;
    }
    ref.value = item[key];
    ref.dispatchEvent(new Event("change"));
  }
};
