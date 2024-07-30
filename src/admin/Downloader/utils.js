import apiUtils from "src/apiUtils";

export const excludeLink = async ({ target }, datas) => {
  const id = target.closest(".link").id;
  if (id) {
    const result = await apiUtils.get(["admin", "downloader", "exclude-link", id]);
    if (result.valid) {
      const found = datas.links.findIndex((f) => f.Id === +id);
      if (found > -1) {
        datas.links[found].Exclude = !datas.links[found].Exclude;
      }
    }
  }
  return datas.links;
};