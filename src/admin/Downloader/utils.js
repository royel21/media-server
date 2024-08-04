import apiUtils from "src/apiUtils";
import { sortByName } from "src/ShareComponent/utils";

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

export const updateLink = (link, datas, add) => {
  if (link) {
    const found = datas.links.findIndex((f) => f.Id === link.Id);
    if (found > -1) {
      datas.links[found] = link;
    } else if (add) {
      datas.links = [...datas.links, link].sort(sortByName);
    }
    return [...datas.links];
  }
};
