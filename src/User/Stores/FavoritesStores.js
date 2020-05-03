import { writable } from "svelte/store";
import axios from "axios";

const FavoritesStores = writable([]);

const addUpdateFavorite = async (fav) => {
  const resp = await axios.post("/api/files/favorites/add-edit", fav);
  if (resp.data.Id) {
    FavoritesStores.update((favs) => {
      return (favs = [...favs.filter((f) => f.Id !== fav.Id), resp.data].sort((f1, f2) =>
        f1.Name.localeCompare(f2.Name)
      ));
    });
  }
  return resp.data;
};

const removeFavorite = async (Id, Type) => {
  const resp = await axios.delete("/api/files/favorites/remove", {
    data: { Id, Type },
  });
  if (resp.data.removed) {
    FavoritesStores.update((favs) => (favs = favs.filter((fav) => fav.Id !== Id)));
  }
  return resp.data;
};

export { FavoritesStores, addUpdateFavorite, removeFavorite };
