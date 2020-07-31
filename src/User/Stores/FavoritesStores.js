import { writable } from "svelte/store";
import axios from "axios";

const FavoritesStores = writable([]);

const addUpdateFavorite = async (fav) => {
  const { data } = await axios.post("/api/files/favorites/add-edit", fav);
  if (data.Id) {
    FavoritesStores.update((favs) => {
      return (favs = [...favs.filter((f) => f.Id !== fav.Id), data].sort((f1, f2) =>
        f1.Name.localeCompare(f2.Name)
      ));
    });
  }
  return data;
};

const removeFavorite = async (Id, Type) => {
  const { data } = await axios.delete("/api/files/favorites/remove", {
    data: { Id, Type },
  });
  console.log(data);
  if (data.removed) {
    FavoritesStores.update((favs) => (favs = favs.filter((fav) => fav.Id !== Id)));
  }
  return data;
};

export { FavoritesStores, addUpdateFavorite, removeFavorite };
