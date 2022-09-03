import { writable } from "svelte/store";
import axios from "axios";
import { sortByName } from "./StoreUtils";

const FavoritesStores = writable([]);

const favApi = "/api/files/favorites/";

const addUpdateFavorite = async (fav) => {
  const { data } = await axios.post(favApi + "create-update", fav);
  if (data.Id) {
    FavoritesStores.update((favs) => [...favs.filter((f) => f.Id !== fav.Id), data].sort(sortByName));
  }
  return data;
};

const removeFavorite = async (Id, Type) => {
  const { data } = await axios.delete(favApi + "remove", {
    data: { Id, Type },
  });
  if (data.removed) {
    FavoritesStores.update((favs) => (favs = favs.filter((fav) => fav.Id !== Id)));
  }
  return data;
};

export { FavoritesStores, addUpdateFavorite, removeFavorite };
