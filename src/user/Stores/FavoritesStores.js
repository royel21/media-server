import { sortByName } from "../../ShareComponent/utils";
import { writable } from "svelte/store";
import apiUtils from "../../apiUtils";

const FavoritesStores = writable([]);

const addUpdateFavorite = async (fav) => {
  const data = await apiUtils.postFav("create-update", fav);
  if (data.Id) {
    FavoritesStores.update((favs) => [...favs.filter((f) => f.Id !== fav.Id), data].sort(sortByName));
  }
  return data;
};

const removeFavorite = async (Id, Type) => {
  const result = await apiUtils.postFav("remove", { Id, Type });
  if (result.removed) {
    FavoritesStores.update((favs) => (favs = favs.filter((fav) => fav.Id !== Id)));
  }
  return result;
};

export { FavoritesStores, addUpdateFavorite, removeFavorite };
