<script>
  import { onMount } from "svelte";
  import { FavoritesStores } from "../Stores/FavoritesStores";
  import FavoriteManager from "../Component/FavoriteManager.svelte";

  import FilesList from "../Component/FilesList.svelte";
  import { getContext } from "svelte";
  export let page = 1;
  export let filter = "";
  export let id = "";
  const User = getContext("User");
  let favId = id || $FavoritesStores[0].Id;
  let type = `favorites/${favId}`;
  $: favId = id || $FavoritesStores[0].Id;

  const removeFavFile = async ({ detail }) => {
    let nextPage = page;
    if (filesData.files.length === 1) {
      nextPage = page > 1 ? page - 1 : page;
    }

    let items = config.items;
    items = items === 0 ? getFilesPerPage(3) : items;

    const { data } = await Axios.post("/api/files/favorites/remove-file", {
      id: favId,
      fid: detail,
      page: nextPage,
      order: config.order,
      items,
      search: filter
    });

    if (data.removed) {
      navigate(`/favorites/${id}/${nextPage}/${filter}`, { replace: true });
    }
  };
  const favClick = event => {
    console.log(event);
  };
</script>

<style>
  .first-controls {
    position: absolute;
    z-index: 99;
    pointer-events: all;
  }
  input[type="checkbox"] {
    display: none;
  }
</style>

<FilesList
  title="Favorites"
  {type}
  {filter}
  {page}
  id={favId}
  on:click={favClick}>
  <div class="first-controls">
    <label for="show-favs">
      <i class="fas fa-heart" />
    </label>
    <input type="checkbox" id="show-favs" />
    <FavoriteManager {favId} />
  </div>
</FilesList>
